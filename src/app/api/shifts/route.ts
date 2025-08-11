import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = new PrismaClient();
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let shifts;
    
    if (dbUser.role === 'MANAGER') {
      // Managers can see all shifts
      shifts = await prisma.shift.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicUrl: true
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
        orderBy: { startTime: 'desc' }
      });
    } else {
      // Workers can only see their own shifts
      shifts = await prisma.shift.findMany({
        where: { userId: dbUser.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicUrl: true
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
        orderBy: { startTime: 'desc' }
      });
    }

    await prisma.$disconnect();
    
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
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
    const { locationId, note } = body;

    const prisma = new PrismaClient();

    // Get the user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow careworkers to create shifts
    if (dbUser.role !== 'CAREWORKER') {
      return NextResponse.json({ error: 'Only careworkers can create shifts' }, { status: 403 });
    }

    // Check if user already has an active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: dbUser.id,
        status: 'IN_PROGRESS'
      }
    });

    if (activeShift) {
      return NextResponse.json({ error: 'You already have an active shift. Please end it first.' }, { status: 400 });
    }

    // Validate location if provided
    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId }
      });

      if (!location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }
    }

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const startTime = now.toISOString();

    // Create new shift
    const shift = await prisma.shift.create({
      data: {
        userId: dbUser.id,
        date: now,
        day: dayName,
        startTime: startTime,
        endTime: startTime, // Will be updated when shift ends
        locationId: locationId || null,
        totalHours: 0, // Will be calculated when shift ends
        status: 'IN_PROGRESS',
        note: note || null
      },
      include: {
        location: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Update user's last clock-in time
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastClockIn: now }
    });

    await prisma.$disconnect();

    return NextResponse.json({ 
      shift,
      message: 'Shift started successfully'
    });
  } catch (error) {
    console.error('Error creating shift:', error);
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
    const { action, shiftId, note } = body;

    const prisma = new PrismaClient();

    // Get the user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow careworkers to update shifts
    if (dbUser.role !== 'CAREWORKER') {
      return NextResponse.json({ error: 'Only careworkers can update shifts' }, { status: 403 });
    }

    if (action === 'end_shift') {
      // Find active shift
      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: dbUser.id,
          status: 'IN_PROGRESS'
        }
      });

      if (!activeShift) {
        return NextResponse.json({ error: 'No active shift found' }, { status: 404 });
      }

      const now = new Date();
      const startTime = new Date(activeShift.startTime);
      const totalHours = Math.round(((now.getTime() - startTime.getTime()) / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places

      // Update shift
      const updatedShift = await prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          endTime: now.toISOString(),
          totalHours: totalHours,
          status: 'COMPLETED',
          note: note || activeShift.note
        },
        include: {
          location: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Update user statistics
      const userShifts = await prisma.shift.findMany({
        where: {
          userId: dbUser.id,
          status: 'COMPLETED'
        }
      });

      const totalShifts = userShifts.length;
      const averageHours = userShifts.reduce((sum, shift) => sum + shift.totalHours, 0) / totalShifts;

      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          totalShifts: totalShifts,
          averageHours: Math.round(averageHours * 100) / 100
        }
      });

      return NextResponse.json({ 
        shift: updatedShift,
        message: `Shift completed! Total hours: ${totalHours}`
      });
    }

    if (action === 'update_note') {
      if (!shiftId) {
        return NextResponse.json({ error: 'Shift ID is required' }, { status: 400 });
      }

      // Find the shift
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId }
      });

      if (!shift) {
        return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
      }

      // Check if user owns the shift
      if (shift.userId !== dbUser.id) {
        return NextResponse.json({ error: 'You can only update your own shifts' }, { status: 403 });
      }

      // Update note
      const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: { note: note || null },
        include: {
          location: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({ 
        shift: updatedShift,
        message: 'Note updated successfully'
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 