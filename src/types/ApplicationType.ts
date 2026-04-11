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

export const applications: Application[] = [
  {
    id: 1,
    company: "Google",
    role: "Data Analyst",
    status: "interview",
    appliedAt: "2026-03-20",
    location: "Remote",
    jobUrl: "https://careers.google.com/jobs/results/123",
    notes: "Passed initial screening, preparing for technical interview",
    createdAt: "2026-03-20T10:15:00Z",
    updatedAt: "2026-03-25T14:30:00Z",
  },
  {
    id: 2,
    company: "Amazon",
    role: "Business Data Analyst",
    status: "applied",
    appliedAt: "2026-04-01",
    location: "Dubai, UAE",
    jobUrl: "https://amazon.jobs/en/jobs/456",
    notes: "Referred by a friend",
    createdAt: "2026-04-01T08:00:00Z",
    updatedAt: "2026-04-01T08:00:00Z",
  },
  {
    id: 3,
    company: "Meta",
    role: "Data Scientist",
    status: "rejected",
    appliedAt: "2026-02-15",
    location: "Remote",
    jobUrl: "https://www.metacareers.com/jobs/789",
    notes: "Rejected after technical assessment",
    createdAt: "2026-02-15T12:20:00Z",
    updatedAt: "2026-02-28T09:10:00Z",
  },
  {
    id: 4,
    company: "Stripe",
    role: "Product Data Analyst",
    status: "offer",
    appliedAt: "2026-03-10",
    location: "London, UK",
    jobUrl: "https://stripe.com/jobs/101",
    notes: "Received offer, negotiating salary",
    createdAt: "2026-03-10T09:45:00Z",
    updatedAt: "2026-03-30T16:00:00Z",
  },
  {
    id: 5,
    company: "Shopify",
    role: "Data Analyst",
    status: "interview",
    appliedAt: "2026-03-28",
    location: "Remote",
    jobUrl: "https://www.shopify.com/careers/202",
    notes: "Second round interview scheduled",
    createdAt: "2026-03-28T11:10:00Z",
    updatedAt: "2026-04-05T13:25:00Z",
  },
  {
    id: 6,
    company: "Tesla",
    role: "Operations Data Analyst",
    status: "applied",
    appliedAt: "2026-04-05",
    location: "Berlin, Germany",
    jobUrl: "https://www.tesla.com/careers/303",
    createdAt: "2026-04-05T07:30:00Z",
    updatedAt: "2026-04-05T07:30:00Z",
  },
  {
    id: 7,
    company: "Airbnb",
    role: "Data Scientist",
    status: "rejected",
    appliedAt: "2026-02-25",
    location: "Remote",
    jobUrl: "https://careers.airbnb.com/jobs/404",
    notes: "Strong competition",
    createdAt: "2026-02-25T15:00:00Z",
    updatedAt: "2026-03-05T10:45:00Z",
  },
  {
    id: 8,
    company: "Netflix",
    role: "Analytics Engineer",
    status: "interview",
    appliedAt: "2026-03-18",
    location: "Los Angeles, USA",
    jobUrl: "https://jobs.netflix.com/jobs/505",
    notes: "Technical case study pending",
    createdAt: "2026-03-18T13:40:00Z",
    updatedAt: "2026-04-02T17:20:00Z",
  },
  {
    id: 9,
    company: "Uber",
    role: "Data Analyst",
    status: "offer",
    appliedAt: "2026-03-05",
    location: "Amsterdam, Netherlands",
    jobUrl: "https://www.uber.com/careers/606",
    notes: "Offer received, deadline next week",
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-29T18:00:00Z",
  },
  {
    id: 10,
    company: "Spotify",
    role: "Product Analyst",
    status: "applied",
    appliedAt: "2026-04-07",
    location: "Stockholm, Sweden",
    jobUrl: "https://www.spotifyjobs.com/jobs/707",
    createdAt: "2026-04-07T09:20:00Z",
    updatedAt: "2026-04-07T09:20:00Z",
  },
];
