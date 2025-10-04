"use client";
import useSWR from "swr";
import { jfetch } from "./fetcher";

export type Me = { user: null | { id:string; email:string; name?:string|null; role:"ADMIN"|"EDITOR"|"VIEWER" } };
export function useMe() {
  const { data, error, mutate, isLoading } = useSWR<Me>("/api/auth/me", jfetch);
  return { me: data?.user ?? null, error, mutate, isLoading };
}
