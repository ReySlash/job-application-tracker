import z from 'zod';

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default createUserSchema;
export type CreateUserData = z.infer<typeof createUserSchema>;