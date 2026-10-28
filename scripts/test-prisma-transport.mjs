// Test-only Prisma transport backed by isolated PostgreSQL. API tests exercise
// real NOT NULL, unique constraints and transactions without a production DB.
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";

export function testTransport(db, hooks = {}) {
  const run = async (sql, values = []) => {
    try { return await db.query(sql, values); }
    catch (error) {
      const code = { "23505": "P2002", "23502": "P2011", "23503": "P2003" }[error.code];
      if (code) throw new Prisma.PrismaClientKnownRequestError(error.message, { code, clientVersion: "test" });
      throw error;
    }
  };
  const filter = (where = {}) => {
    const values = [];
    const bind = (value) => { values.push(value); return `$${values.length}`; };
    const clause = (entries) => Object.entries(entries).map(([key, value]) => {
      if (key === "OR") return `(${value.map(clause).join(" OR ")})`;
      if (value && typeof value === "object" && "in" in value) return `"${key}" IN (${value.in.map(bind).join(", ") || "NULL"})`;
      if (value && typeof value === "object" && "contains" in value) return `"${key}" ILIKE ${bind(`%${value.contains}%`)}`;
      if (value && typeof value === "object" && "equals" in value) return value.mode === "insensitive"
        ? `LOWER("${key}") = LOWER(${bind(value.equals)})` : `"${key}" = ${bind(value.equals)}`;
      return `"${key}" = ${bind(value)}`;
    }).join(" AND ") || "TRUE";
    return { sql: clause(where), values };
  };
  const select = (row, fields) => !row ? null : !fields ? row
    : Object.fromEntries(Object.entries(row).filter(([key]) => fields[key]));
  const model = (table) => ({
    async findUnique({ where, select: fields }) {
      const { sql, values } = filter(where);
      return select((await run(`SELECT * FROM "${table}" WHERE ${sql}`, values)).rows[0], fields);
    },
    async findFirst({ select: fields } = {}) {
      const columns = fields ? Object.keys(fields).map((key) => `"${key}"`).join(", ") : "*";
      return (await run(`SELECT ${columns} FROM "${table}" LIMIT 1`)).rows[0] || null;
    },
    async findMany({ where, skip = 0, take = 100, select: fields, orderBy } = {}) {
      const { sql, values } = filter(where);
      const ordering = orderBy ? (Array.isArray(orderBy) ? orderBy : [orderBy]).flatMap(entry => Object.entries(entry).map(([key, direction]) => `"${key}" ${direction === "asc" ? "ASC" : "DESC"}`)).join(", ") : table === "Setting" ? '"key" ASC' : '"createdAt" DESC, "id" DESC';
      return (await run(`SELECT * FROM "${table}" WHERE ${sql} ORDER BY ${ordering} LIMIT ${take} OFFSET ${skip}`, values)).rows.map((row) => select(row, fields));
    },
    async count({ where } = {}) {
      const { sql, values } = filter(where);
      return Number((await run(`SELECT COUNT(*) FROM "${table}" WHERE ${sql}`, values)).rows[0].count);
    },
    async create({ data, select: fields }) {
      if (table === "AuditLog") hooks.beforeAudit?.();
      const record = { id: randomUUID(), ...data, ...(["User", "Subdomain", "TeamMember", "Setting"].includes(table) ? { updatedAt: new Date() } : {}) };
      const entries = Object.entries(record).filter(([, value]) => value !== undefined);
      const columns = entries.map(([key]) => `"${key}"`).join(", ");
      const params = entries.map((_, index) => `$${index + 1}`).join(", ");
      return select((await run(`INSERT INTO "${table}" (${columns}) VALUES (${params}) RETURNING *`, entries.map(([, value]) => value))).rows[0], fields);
    },
    async update({ where, data, select: fields }) {
      const { sql, values } = filter(where);
      const updates = Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => {
        if (value && typeof value === "object" && "increment" in value) return `"${key}" = "${key}" + ${Number(value.increment)}`;
        values.push(value);
        return `"${key}" = $${values.length}`;
      });
      const row = (await run(`UPDATE "${table}" SET ${updates.join(", ")} WHERE ${sql} RETURNING *`, values)).rows[0];
      if (!row) throw new Prisma.PrismaClientKnownRequestError("Missing row", { code: "P2025", clientVersion: "test" });
      return select(row, fields);
    },
    async delete({ where }) {
      const { sql, values } = filter(where);
      const row = (await run(`DELETE FROM "${table}" WHERE ${sql} RETURNING *`, values)).rows[0];
      if (!row) throw new Prisma.PrismaClientKnownRequestError("Missing row", { code: "P2025", clientVersion: "test" });
      return row;
    },
    async upsert({ where, update, create }) {
      const existing = await this.findUnique({ where });
      if (!existing) return this.create({ data: create });
      return Object.keys(update).length ? this.update({ where, data: update }) : existing;
    },
    async updateMany({ where, data }) {
      const { sql, values } = filter(where);
      return { count: (await run(`UPDATE "${table}" SET "sessionVersion" = "sessionVersion" + ${Number(data.sessionVersion.increment)} WHERE ${sql}`, values)).affectedRows };
    },
  });
  return {
    async $queryRaw(parts, ...values) {
      return (await run(parts.reduce((sql, part, index) => sql + (index ? `$${index}` : "") + part, ""), values)).rows;
    },
    async $executeRaw(parts, ...values) {
      return (await run(parts.reduce((sql, part, index) => sql + (index ? `$${index}` : "") + part, ""), values)).affectedRows;
    },
    $transaction: (callback) => db.transaction((tx) => callback(testTransport(tx, hooks))),
    user: model("User"), auditLog: model("AuditLog"), subdomain: model("Subdomain"), teamMember: model("TeamMember"), media: model("Media"), setting: model("Setting"),
  };
}
