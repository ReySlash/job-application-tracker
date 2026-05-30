import z from 'zod';

const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default authCredentialsSchema;
export type AuthCredentialsData = z.infer<typeof authCredentialsSchema>;
