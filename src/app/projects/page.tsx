'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code, Github, ExternalLink, Star } from 'lucide-react';
import axios from 'axios';

type User = {
  id: string;
  username: string;
  githubUsername: string | null;
  email: string;
  section: string;
  rollNumber: string;
  isComplete: boolean;
}

type Project = {
  id: string;
  title: string;
  githubLink: string;
  deployedLink: string;
  feedback: string | null;
  rating: string | null;
  userId: string;
  user: User;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await axios.get('/api/projects');
        
        if (response.data.success) {
          setProjects(response.data.projects);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black/[0.96] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2a5d75]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black/[0.96] flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-6 py-4 rounded-xl">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className="container mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Student Projects
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {

  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">{project.title}</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">By:</span>
          <span className="text-gray-300">{project.user.username}</span>
          {project.user.githubUsername && (
            <Link 
              href={`https://github.com/${project.user.githubUsername}`}
              target="_blank"
              className="text-[#2a5d75] hover:text-[#3a7d95] transition-colors"
            >
              @{project.user.githubUsername}
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Rating: {project.rating}</span>
          
        </div>

        {project.feedback && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-400 mb-1">Feedback:</h3>
            <p className="text-gray-300 text-sm italic">{project.feedback}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3 pt-4">
          <Link 
            href={project.deployedLink} 
            target="_blank"
            className="bg-[#2a5d75] hover:bg-[#1d4254] text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Project
          </Link>
          <Link 
            href={project.githubLink} 
            target="_blank"
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub Repo
          </Link>
        </div>
      </div>
    </div>
  );
}