import type { Application } from "./ApplicationType";

export type ApplicationInput = Omit<
  Application,
  "id" | "createdAt" | "updatedAt"
>;
