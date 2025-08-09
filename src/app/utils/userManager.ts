import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Auth0User {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  profilePicUrl?: string | null;
  role: 'CAREWORKER' | 'MANAGER';
  averageHours?: number | null;
  totalShifts?: number | null;
  lastClockIn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function findOrCreateUser(auth0User: Auth0User): Promise<DatabaseUser> {
  if (!auth0User.email) {
    throw new Error('Email is required for user creation');
  }

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: auth0User.email }
  });

  if (!user) {
    // Create new user with default CAREWORKER role
    user = await prisma.user.create({
      data: {
        name: auth0User.name || auth0User.email,
        email: auth0User.email,
        profilePicUrl: auth0User.picture || null,
        // role defaults to CAREWORKER as per schema
      }
    });
  } else {
    // Update existing user with latest Auth0 data
    user = await prisma.user.update({
      where: { email: auth0User.email },
      data: {
        name: auth0User.name || auth0User.email,
        profilePicUrl: auth0User.picture || null,
      }
    });
  }

  return user;
}

export async function getUserByEmail(email: string): Promise<DatabaseUser | null> {
  return await prisma.user.findUnique({
    where: { email }
  });
}

export async function updateUserRole(email: string, role: 'CAREWORKER' | 'MANAGER'): Promise<DatabaseUser> {
  return await prisma.user.update({
    where: { email },
    data: { role }
  });
} 