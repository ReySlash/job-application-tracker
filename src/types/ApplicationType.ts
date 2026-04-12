export type Application = {
  id: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
  location: string;
  jobUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";
