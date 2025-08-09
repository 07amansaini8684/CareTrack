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

    // Only allow managers to fetch all shifts
    if (dbUser.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Only managers can access all shifts' }, { status: 403 });
    }

    // Get all shifts with user and location information
    const allShifts = await prisma.shift.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            radius: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ shifts: allShifts });
  } catch (error) {
    console.error('Error fetching all shifts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 