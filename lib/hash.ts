import bcrypt from "bcryptjs";

export const hash = async (s: string) => {
  return await bcrypt.hash(s, 12);
};

export const compare = async (s: string, h: string) => {
  return await bcrypt.compare(s, h);
};
