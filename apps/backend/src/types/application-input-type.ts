export type ApplicationInput = {
  company: string;
  role: string;
  status: "applied" | "interview" | "offer" | "rejected";
  appliedAt: string;
  location: string;
  jobUrl?: string;
  notes?: string;
}