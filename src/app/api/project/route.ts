// app/api/projects/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      githubUrl,
      projectType,
      demoUrl,
      title,
      userEmail,
      description,
      feedback,
      rating
    } = await request.json();

    // Validate required fields
    if (!githubUrl || !projectType || !description || !userEmail || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      },
      select: {
        id: true
      }
    });

    if (!user) {
      return NextResponse.json({ message: "No user found" }, { status: 400 });
    }

    // Check if a project with this title already exists
    const existingProject = await prisma.project.findUnique({
      where: {
        title: title
      }
    });

    let project;
    let isNewProject = false;

    if (existingProject) {
      // Update existing project
      project = await prisma.project.update({
        where: {
          title: title
        },
        data: {
          githubLink: githubUrl,
          deployedLink: demoUrl || existingProject.deployedLink,
          feedback: feedback !== undefined ? feedback : existingProject.feedback,
          rating: rating !== undefined ? rating : existingProject.rating,
          // We don't update userId as the project owner shouldn't change
        }
      });
    } else {
      // Create new project
      project = await prisma.project.create({
        data: {
          title: title,
          githubLink: githubUrl,
          deployedLink: demoUrl || '',
          feedback: feedback || null,
          rating: rating || null,
          userId: user.id
        }
      });
      isNewProject = true;
    }

    return NextResponse.json({
      success: true,
      project,
      isNewProject
    }, {
      status: isNewProject ? 201 : 200
    });
  } catch (error: any) {
    console.error('Error handling project:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      let errorMessage = 'A unique constraint would be violated.';
      
      if (target?.includes('githubLink')) {
        errorMessage = 'A project with this GitHub URL already exists';
      } else if (target?.includes('deployedLink')) {
        errorMessage = 'A project with this deployed link already exists';
      } else if (target?.includes('title')) {
        errorMessage = 'A project with this title already exists';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to handle project' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to retrieve projects
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const projectTitle = searchParams.get('title');
    
    // Build query conditions
    const whereCondition: any = {};
    
    if (projectTitle) {
      whereCondition.title = projectTitle;
    }
    
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json({ message: "No user found" }, { status: 400 });
      }
      
      whereCondition.userId = user.id;
    }
    
    // Get project(s)
    const projects = await prisma.project.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve projects' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}