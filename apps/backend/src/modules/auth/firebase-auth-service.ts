import prisma from '../../db.js';

type FirebaseIdentity = {
  uid: string;
  email: string;
  emailVerified: boolean;
};

type SyncedUser = {
  id: string;
  email: string;
  isDemo: boolean;
  isEmailVerified: boolean;
  firebaseUid: string | null;
};

export async function syncFirebaseUser(identity: FirebaseIdentity): Promise<SyncedUser> {
  const existingByUid = await prisma.user.findUnique({
    where: { firebaseUid: identity.uid },
  });

  if (existingByUid) {
    return prisma.user.update({
      where: { id: existingByUid.id },
      data: {
        email: identity.email,
        isDemo: false,
        isEmailVerified: identity.emailVerified,
      },
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: identity.email },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        firebaseUid: identity.uid,
        isDemo: false,
        isEmailVerified: identity.emailVerified,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: identity.email,
      firebaseUid: identity.uid,
      isDemo: false,
      isEmailVerified: identity.emailVerified,
    },
  });
}
