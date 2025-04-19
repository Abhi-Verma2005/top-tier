// app/api/projects/[id]/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Project, Prisma } from '@prisma/client';

// Define the Update type for project updates
type ProjectUpdate = Partial<{
  feedback: string;
  rating: string;
  githubLink: string;
  deployedLink: string;
  title: string;
}>;

export async function PUT(
  request: Request,
) {
  try {
    const url = request.url;
    const title = url.split('/')[url.split('/').length - 1];
    
    if (!title) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { title }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get update data from request body
    const { feedback, rating, githubUrl, demoUrl, projectType } = await request.json() as {
      feedback?: string;
      rating?: string;
      githubUrl?: string;
      demoUrl?: string;
      projectType?: string;
    };
    
    // Update only the fields that are provided
    const updateData: ProjectUpdate = {};
    
    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating;
    if (githubUrl !== undefined) updateData.githubLink = githubUrl;
    if (demoUrl !== undefined) updateData.deployedLink = demoUrl;
    if (projectType !== undefined) updateData.title = projectType;

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { title },
      data: updateData
    });

    return NextResponse.json({ success: true, project: updatedProject }, { status: 200 });
  } catch (error) {
    console.error('Error updating project:', error);
    
    // Handle unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A project with this GitHub URL or deployed link already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
    const url = request.url;
    const title = url.split('/')[url.split('/').length - 1];
    
    if (!title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { title }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving project:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve project' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE endpoint for removing a project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete the project
    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}