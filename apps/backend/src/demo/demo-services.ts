import crypto from 'node:crypto';
import prisma from '../db.js';
import { ApplicationStatus } from '../generated/prisma/enums.js';
import { AppError } from '../lib/errors.js';

const DEMO_USER_TTL_MS = 60 * 60 * 1000;

type DemoApplicationSeed = {
  company: string;
  role: string;
  status: ApplicationStatus;
  daysAgo: number;
  location: string;
  jobUrl: string;
  notes: string;
};

const demoApplicationSeeds: DemoApplicationSeed[] = [
  {
    company: 'Northstar Labs',
    role: 'Frontend Engineer',
    status: ApplicationStatus.INTERVIEWING,
    daysAgo: 1,
    location: 'Remote',
    jobUrl: 'https://example.com/northstar-frontend',
    notes: 'Technical screen scheduled. Review React Query and dashboard work.',
  },
  {
    company: 'BrightPath Health',
    role: 'React Developer',
    status: ApplicationStatus.APPLIED,
    daysAgo: 4,
    location: 'Miami, FL',
    jobUrl: 'https://example.com/brightpath-react',
    notes: 'Strong match for forms, validation, and user-facing workflows.',
  },
  {
    company: 'Atlas Cloud',
    role: 'UI Engineer',
    status: ApplicationStatus.OFFER,
    daysAgo: 9,
    location: 'Hybrid',
    jobUrl: 'https://example.com/atlas-ui',
    notes: 'Offer received. Compare benefits, growth path, and project ownership.',
  },
  {
    company: 'Finch Analytics',
    role: 'Product Frontend Developer',
    status: ApplicationStatus.APPLIED,
    daysAgo: 18,
    location: 'Remote',
    jobUrl: 'https://example.com/finch-product-frontend',
    notes: 'Needs follow-up because the application is older than two weeks.',
  },
  {
    company: 'Orbit Retail',
    role: 'TypeScript Engineer',
    status: ApplicationStatus.REJECTED,
    daysAgo: 28,
    location: 'New York, NY',
    jobUrl: 'https://example.com/orbit-typescript',
    notes: 'Rejected after recruiter screen. Useful comparison point for funnel metrics.',
  },
  {
    company: 'Cedar Studio',
    role: 'Junior Full Stack Developer',
    status: ApplicationStatus.APPLIED,
    daysAgo: 45,
    location: 'Austin, TX',
    jobUrl: 'https://example.com/cedar-full-stack',
    notes: 'Older application kept in the demo to make monthly activity charts useful.',
  },
];

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function createDemoEmail() {
  return `demo-${crypto.randomUUID()}@demo.local`;
}

function mapDemoSeedsToCreateManyData(userId: string) {
  return demoApplicationSeeds.map((seed) => ({
    company: seed.company,
    role: seed.role,
    status: seed.status,
    appliedAt: getDateDaysAgo(seed.daysAgo),
    location: seed.location,
    jobUrl: seed.jobUrl,
    notes: seed.notes,
    userId,
  }));
}

export async function cleanupExpiredDemoUsers() {
  const expiresBefore = new Date(Date.now() - DEMO_USER_TTL_MS);

  const result = await prisma.user.deleteMany({
    where: {
      isDemo: true,
      createdAt: {
        lt: expiresBefore,
      },
    },
  });

  return result.count;
}

export async function createDemoUser() {
  await cleanupExpiredDemoUsers();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: createDemoEmail(),
        isDemo: true,
      },
    });

    await tx.application.createMany({
      data: mapDemoSeedsToCreateManyData(user.id),
    });

    return user;
  });
}

export async function resetDemoApplicationsForUser(userId: string, isDemo: boolean) {
  if (!isDemo) {
    throw new AppError('Demo reset is only available for demo users', 403);
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.deleteMany({
      where: {
        userId,
      },
    });

    await tx.application.createMany({
      data: mapDemoSeedsToCreateManyData(userId),
    });
  });
}
