"use client";

import useSWR from "swr";

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl?: string | null;
  status: "LIVE" | "UAT" | "DRAFT";
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || r.statusText);
    return r.json();
  });

/**
 * /api/projects hem [] hem {items: []} gelebileceği için normalize eder.
 */
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[] | { items: Project[] }>(
    "/api/projects",
    fetcher,
    { revalidateOnFocus: false }
  );

  const list: Project[] = Array.isArray(data) ? data : (data?.items ?? []);

  return {
    projects: list,
    isLoading: !data && !error || isLoading,
    error,
    mutate,
  };
}
