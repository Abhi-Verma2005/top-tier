'use client'

import React, { useState } from 'react';
import { ProjectorIcon, X, Github, Globe, Code, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import ThinkingLoader from '../ThinkingLoader';
import useTokenStore from '@/store/token';
import useMessageStore, { Message } from '@/store/messages';
import { Octokit } from '@octokit/core';

interface ProjectDetails {
  githubUrl: string;
  techStack: string;
  projectType: string;
  demoUrl: string;
  description: string;
  demoCode: string;
  filePath: string;
  teamMembers: string;
  challengesFaced: string;
}

const ProjectSubmissionForm: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { addMessage, sendMessage, isLoading, setIsLoading, sendToGeminiStream } = useMessageStore()
  const [repos, setRepos] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const { token } = useTokenStore()
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    githubUrl: '',
    techStack: '',
    projectType: '',
    demoUrl: '',
    description: '',
    filePath: '',
    teamMembers: '',
    demoCode: '',
    challengesFaced: ''
  });

  const getRepos = async () => {
    try {
      setIsLoadingRepos(true);    
      const res = await axios.post('/api/fetchRepos', {
        accessToken: token
      });
      
      if(res.status === 235){
        toast.error(res.data.message);
        setIsLoadingRepos(false);
        return;
      }
      
      if(res.status === 200){
        toast.success('Repositories loaded successfully');
        setRepos(res.data.repos);
        setGithubUsername(res.data.githubUsername);
      }
      
      setIsLoadingRepos(false);
    } catch (error) {
      console.error('Error in getRepos', error);
      toast.error('Token Expired, Reconnect Github');
      localStorage.removeItem('githubAccessToken')
      connect();
      setIsLoadingRepos(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const octokit = new Octokit({
      auth: token
    });
  
    if(!githubUsername) {
      toast.error('Github Username Not Found')
      return 
    }
  
    let formattedMessage = `
    GitHub Repository: ${projectDetails.githubUrl}
    Tech Stack: ${projectDetails.techStack}
    Project Type: ${projectDetails.projectType}
    Live Demo: ${projectDetails.demoUrl}
    Description: ${projectDetails.description}
        `.trim();
  
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: githubUsername,
        repo: selectedRepo,
        path: projectDetails.filePath,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      //@ts-expect-error: no need here
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      setProjectDetails({...projectDetails, demoCode: content})
      formattedMessage = `
    GitHub Repository: ${projectDetails.githubUrl}
    Tech Stack: ${projectDetails.techStack}
    Project Type: ${projectDetails.projectType}
    Live Demo: ${projectDetails.demoUrl}
    Description: ${projectDetails.description}
    Demo Code: ${content}
        `.trim();
    } catch (error) {
      console.error(`Error fetching file content: ${error}`);
    }
    
    setShowModal(false);
  
    const userMessage: Message = {
      id: Date.now().toString(),
      text: formattedMessage,
      sender: 'user',
      timestamp: new Date(),
      isCode: false
    };
    addMessage(userMessage);
    
    const initialAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thanks for submitting your project details! I'll analyze your repository and provide feedback shortly.",
      sender: 'ai',
      timestamp: new Date(),
      isCode: false
    };
    addMessage(initialAiMessage);
  
    setIsLoading(true);
  
    try {
      const response = await axios.post("/api/geminiRate", {
        formattedMessage
      }, { timeout: 25000 });
  
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: response.data.insights || "AI response error!",
        sender: 'ai',
        timestamp: new Date(),
        isCode: false
      };
  
      addMessage(aiMessage)
  
    } catch(error) {
      console.error('Error while getting rating from ai: ', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error while analyzing your project. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        isCode: false
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const modalOpen = () => {
    setShowModal(true);
  };

  const connectGithub = async () => {
    try {
      window.location.href = "/api/auth/github/login";
    } catch (error) {
      console.log('Error in connectGithub function', error);
    }
  };

  const connect = () => {
    toast((t) => (
      <div className="flex flex-col text-white bg-gray-800 p-2 rounded-lg">
        <p className="font-semibold">Your Github isn't connected</p>
        <div className="flex gap-2 mt-2 justify-center">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              connectGithub();
            }} 
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
          >
            Connect
          </button>
        </div>
      </div>
    ), { duration: 5000 }); 
  };

  const selectRepository = (repo: string) => {
    setSelectedRepo(repo);
    setProjectDetails(prev => ({
      ...prev,
      githubUrl: `https://github.com/${githubUsername}/${repo}`
    }));
  };


  const triggerButton = (
    <Button 
      onClick={modalOpen}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 shadow-lg shadow-blue-500/20"
    >
      <ProjectorIcon size={20} />
      Submit Project
    </Button>
  );

  return (
    <>
      {triggerButton}
      
      {isLoading && <ThinkingLoader />}
      

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <ProjectorIcon className="mr-2 text-blue-400" size={20} />
                  Submit Your Project
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleProjectSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Github size={16} className="mr-2 text-gray-400" />
                      GitHub Repository URL <span className="text-red-400 ml-1">*</span>
                    </label>
                    
                    <div className="mb-2">
                      <input
                        type="url"
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
                        placeholder="https://github.com/username/repo"
                        value={projectDetails.githubUrl}
                        readOnly
                        onChange={(e) => setProjectDetails({...projectDetails, githubUrl: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Button 
                        onClick={getRepos} 
                        className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                        disabled={isLoadingRepos}
                      >
                        <Github size={16} />
                        {isLoadingRepos ? 'Loading...' : 'Import from GitHub'}
                      </Button>
                      
                      {selectedRepo && (
                        <div className="text-sm text-green-400 flex items-center">
                          <CheckCircle size={14} className="mr-1" />
                          Selected: {selectedRepo}
                        </div>
                      )}
                    </div>
                    
                    {repos.length > 0 && (
                      <div className="border border-gray-700 rounded-lg p-2 max-h-40 overflow-y-auto mb-2">
                        <div className="text-sm mb-2 text-gray-400">Select a repository:</div>
                        <div className="grid grid-cols-1 gap-1">
                          {repos.map((repo) => (
                            <button
                              type="button"
                              key={repo}
                              onClick={() => selectRepository(repo)}
                              className={`text-left px-3 py-2 rounded-md text-sm flex items-center ${
                                selectedRepo === repo
                                  ? 'bg-blue-900/50 text-blue-300 font-medium'
                                  : 'hover:bg-gray-800 text-gray-300'
                              }`}
                            >
                              <Github size={14} className="mr-2 text-gray-500" />
                              {repo}
                              {selectedRepo === repo && (
                                <CheckCircle size={14} className="ml-auto text-blue-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Code size={16} className="mr-2 text-gray-400" />
                      Tech Stack <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
                      placeholder="Next.js, TailwindCSS, Prisma, PostgreSQL"
                      value={projectDetails.techStack}
                      onChange={(e) => setProjectDetails({...projectDetails, techStack: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Code size={16} className="mr-2 text-gray-400" />
                      Main File Path <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
                      placeholder="/src/index.js"
                      value={projectDetails.filePath}
                      onChange={(e) => setProjectDetails({...projectDetails, filePath: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      Project Type <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
                      placeholder="E-commerce, SaaS, Portfolio"
                      value={projectDetails.projectType}
                      onChange={(e) => setProjectDetails({...projectDetails, projectType: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Globe size={16} className="mr-2 text-gray-400" />
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
                      placeholder="https://project.vercel.app"
                      value={projectDetails.demoUrl}
                      onChange={(e) => setProjectDetails({...projectDetails, demoUrl: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      Project Description <span className="text-red-400 ml-1">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm resize-none text-white"
                      placeholder="A brief description of your project..."
                      value={projectDetails.description}
                      onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      Team Members
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-white"
                      placeholder="List team members (or solo project)"
                      value={projectDetails.teamMembers}
                      onChange={(e) => setProjectDetails({...projectDetails, teamMembers: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      Challenges Faced
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm resize-none text-white"
                      placeholder="Describe challenges you faced during development"
                      value={projectDetails.challengesFaced}
                      onChange={(e) => setProjectDetails({...projectDetails, challengesFaced: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    onClick={() => sendMessage()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        Submit Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSubmissionForm;