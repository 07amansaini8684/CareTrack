import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { user } = session;
    
    // Check if user exists in our database...
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!dbUser) {
      // Create new user if they don't exist
      dbUser = await prisma.user.create({
        data: {
          name: user.name || user.email!,
          email: user.email!,
          profilePicUrl: user.picture || null,
          // setting up the role to CAREWORKER as per schema....
        }
      });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const { role } = body;

    // Checking if user exists...
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (dbUser) {
      // Updating existing user...
      dbUser = await prisma.user.update({
        where: { email: user.email! },
        data: {
          name: user.name || user.email!,
          profilePicUrl: user.picture || null,
          role: role || 'CAREWORKER'
        }
      });
    } else {
      // Creating new user...
      dbUser = await prisma.user.create({
        data: {
          name: user.name || user.email!,
          email: user.email!,
          profilePicUrl: user.picture || null,
          role: role || 'CAREWORKER'
        }
      });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const { role } = body;

    if (!role || !['CAREWORKER', 'MANAGER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be CAREWORKER or MANAGER' }, { status: 400 });
    }

    // Checking if user already exists...
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user role...
    const updatedUser = await prisma.user.update({
      where: { email: user.email! },
      data: {
        role: role
      }
    });

    return NextResponse.json({ 
      user: updatedUser,
      message: `Role updated to ${role} successfully`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 