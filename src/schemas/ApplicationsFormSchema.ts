import * as z from "zod";

const isValidUrl = (value: string) => {
  if (value.length === 0) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const applicationsFormSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, { message: "This field is required" })
    .min(2, { message: "Company name must be at least 2 characters long." }),
  role: z
    .string()
    .trim()
    .min(1, { message: "This field is required" })
    .min(2, { message: "Role must be at least 2 characters long." }),
  status: z.enum(["applied", "interview", "offer", "rejected"]),
  appliedAt: z
    .string()
    .min(1, { message: "This field is required" })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Please enter a valid date",
    }),
  location: z
    .string()
    .trim()
    .min(1, { message: "This field is required" })
    .min(2, { message: "Location must be at least 2 characters long." }),
  jobUrl: z
    .string()
    .trim()
    .refine(isValidUrl, { message: "Please enter a valid URL" })
    .optional(),
  notes: z.string().trim().optional(),
});

export default applicationsFormSchema;
export type ApplicationsFormSchema = z.infer<typeof applicationsFormSchema>;
