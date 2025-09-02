import { generalFunctions } from "@/lib/generalFuntion";

export async function fetchUsers() {
  try {
    const userUrl = generalFunctions.createUrl("users");
  const res = await fetch(userUrl);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await res.json();
  return data;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}

export async function fetchThreadPreview(threadId: string) {
  try {
    const url = generalFunctions.createUrl(`threads-preview/${threadId}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Thread fetch failed");
  const data = await res.json();
  return data
  } catch (error) {
    throw new Error("Thread fetch failed");
  }
}