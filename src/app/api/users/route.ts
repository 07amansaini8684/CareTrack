import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { user } = session;
    
    // Get the current user from database to check if they're a manager
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow managers to fetch all users
    if (dbUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only managers can access all users' }, { status: 403 });
    }

    // Get all users with their basic information
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profilePicUrl: true,
        role: true,
        averageHours: true,
        totalShifts: true,
        lastClockIn: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 