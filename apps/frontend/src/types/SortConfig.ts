export type SortConfig = {
  sortKey: "company" | "role" | "status" | "appliedAt" | "location";
  sortOrder: "asc" | "desc";
} | null;

export type SortKey = NonNullable<SortConfig>["sortKey"];
export type SortOrder = NonNullable<SortConfig>["sortOrder"];

export type MobileSortOption =
  | "company-asc"
  | "company-desc"
  | "role-asc"
  | "role-desc"
  | "status-asc"
  | "status-desc"
  | "appliedAt-asc"
  | "appliedAt-desc"
  | "location-asc"
  | "location-desc"
  | "none"; // Empty string for no sorting
