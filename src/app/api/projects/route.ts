import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession()
    const user = await prisma.user.findUnique({
        where:{
            email: session?.user.email
        }, select:{
            id: true
        }
    })
    if(!user) return NextResponse.json({ status: 400 })
    const projects = await prisma.project.findMany({
        where:{
            userId: user.id
        },
        include: {
            user: {
            select: {
                username: true,
                githubUsername: true,
            },
            },
      },
    });

    return NextResponse.json({ 
      success: true, 
      projects 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}