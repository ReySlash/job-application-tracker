import bcrypt from 'bcrypt';
import prisma from '../../db.js';

export async function createUser(email: string, password: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      isDemo: false,
    },
  });
}
