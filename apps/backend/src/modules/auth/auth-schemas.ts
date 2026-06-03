import z from 'zod';

const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export default authCredentialsSchema;
