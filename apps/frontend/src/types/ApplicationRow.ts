export type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  status: string;
  applied_at: string;
  location: string | null;
  job_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
};
