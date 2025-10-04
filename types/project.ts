export type Project = {
  id: string; title: string; slug: string; summary: string;
  imageUrl?: string|null; status: "LIVE"|"UAT"|"DRAFT";
  tags: string[]; createdAt: string; updatedAt: string;
};
