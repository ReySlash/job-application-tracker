import z from 'zod';

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default signupSchema;
export type SignupData = z.infer<typeof signupSchema>;
