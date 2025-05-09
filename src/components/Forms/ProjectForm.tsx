'use client'

import React, { useState } from 'react';
import { ProjectorIcon, X, Github, Globe, Code, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import useTokenStore from '@/store/token';
import useMessageStore, { Message } from '@/store/messages';
import { Octokit } from '@octokit/core';
import { getRelevantFoldersFromAi } from '@/lib/rateFunctions';
import { getFile } from '@/serverActions/fetch';
import { useSession } from 'next-auth/react';

interface ProjectDetails {
  githubUrl: string;
  techStack: string;
  projectType: string;
  demoUrl: string;
  description: string;
  demoCode: string;
  teamMembers: string;
  challengesFaced: string;
}

const ProjectSubmissionForm: React.FC = () => {
  const { showModal, setShowModal } = useMessageStore();
  const { addMessage, sendMessage, isLoading, setIsLoading, sendToGeminiStream } = useMessageStore()
  const { data: session } = useSession()
  const [repos, setRepos] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [ prevFeed, setPrevFeed ] = useState('')
  const { token } = useTokenStore()
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    githubUrl: '',
    techStack: '',
    projectType: '',
    demoUrl: '',
    description: '',
    teamMembers: '',
    demoCode: '',
    challengesFaced: ''
  });

  

  const getRepos = async () => {
    try {
      setIsLoadingRepos(true);    
      const res = await axios.post('/api/fetchRepos', {
        accessToken: session?.user.githubAccessToken
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
      setIsLoadingRepos(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Zero is analyzing your project...', {
      duration: Infinity, 
    });
  
    const updateProgress = (message: string) => {
      toast.loading(message, { id: toastId })
    }
    
    async function getRepoStructure(owner: string, repo: string, path: string, token: string) {
      const result: string[] = []
      let count = 0
      const func = async (owner: string, repo: string, path: string, token: string) => {
    
        if(count > 5){
          return ''
        }
        
        count += 1
        
        try {
          const octokit = new Octokit({
            auth: token
          });
    
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: path || '',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      
        const content = Array.isArray(response.data) ? response.data : [response.data];
    
        const inputForAi = content.map((cont) => cont.name)
    
        const folders = await getRelevantFoldersFromAi(inputForAi)
    
        const cleaned = folders
        .replace("```json", "")
        .replace("```", "")
        .trim();
    
        const obj = JSON.parse(cleaned);
    
    
        for (const file of obj.relevantFiles) { 
          const filed = await getFile(token, owner, repo, path + '/' + file)
          updateProgress(`Found ${file}`)
          result.push('File Name: ' + file + " " + filed)  
        }
    
        for (const folder of obj.relevantFolders){
          updateProgress(`Looking into ${folder}...`)
          await func(owner, repo, path + '/' + folder, token)
        }
    
        return content.map(item => ({
          name: item.name,
          type: item.type, 
          path: item.path,
        }));
      } catch(error) {
        console.error('Error in recursive function: ', error)
      } 
        }
      await func(owner, repo, path, token)
      
      return result.join('/n') 
    }
    setShowModal(false);
    try {
      // Check if project already exists in database
      try {
        updateProgress("Checking if project exists in database...")
        const existingProject = await axios.get(`/api/project/${selectedRepo}`);
        
        if (existingProject.status === 200) {
          updateProgress("Found existing project in database...")
          setPrevFeed(existingProject.data.project.feedback)
        }
        
      } catch (error) {
        // Project doesn't exist, continue with submission
        console.log("Project not found in database, proceeding with analysis", error);
      }
      
      let formattedMessage = `
      GitHub Repository: ${projectDetails.githubUrl}
      Tech Stack: ${projectDetails.techStack}
      Project Type: ${projectDetails.projectType}
      Description: ${projectDetails.description}
      `.trim();
      
      const userString = `
      GitHub Repository: ${projectDetails.githubUrl}
      Tech Stack: ${projectDetails.techStack}
      Project Type: ${projectDetails.projectType}
      Description: ${projectDetails.description}
      Demo Code: Analyze from my repository
      `.trim();
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: userString,
        sender: 'user',
        timestamp: new Date(),
        isCode: false
      };
  
      addMessage(userMessage);
      
      setIsLoading(true);
  
      if(!githubUsername) {
        toast.error('Github Username Not Found')
        toast.dismiss(toastId)
        return 
      }
  
      updateProgress("Analyzing repo structure...")
      
      const response = await getRepoStructure(githubUsername, selectedRepo, '', token)
  
      updateProgress("Getting deployed link performance...")
  
      setProjectDetails({...projectDetails, demoCode: response})
        formattedMessage = `
      GitHub Repository: ${projectDetails.githubUrl}
      Tech Stack: ${projectDetails.techStack}
      Project Type: ${projectDetails.projectType}
      Description: ${projectDetails.description}
      Demo Code: ${response}
          `.trim();
  
      const initialAiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Thanks for submitting your project details! I'll analyze your repository and provide feedback shortly.",
        sender: 'ai',
        timestamp: new Date(),
        isCode: false
      };
      addMessage(initialAiMessage);
  
      updateProgress("Zero is analyzing your project...")
  
      const instruction = `You are an expert full-stack developer and brutally honest reviewer. You will receive a formatted message describing a user's dev project — this may include code snippets, project explanation, tech stack used, deployed link, and more. Make it spicy by doing nice roasts a lot, be brutally honest. Your task is to analyze it deeply and rate it based on the following criteria:\n\n1. 🧠 Project Use Case – Is the idea actually a good decent project or is it just a to-do list clone in disguise? Be blunt still not too strict.\n2. 🔧 Tech Stack Used – Go beyond what they *say* they used. If they mention something fancy (e.g., Web3, AI, Redis), but you don't see actual usage or code context, call it out. Give credit where it's due for using anything beyond React frontend (e.g., backend, auth, database, cloud infra, advanced libs).\n3. 🧩 Problem Solving & Depth – Evaluate how well they understood the issues faced during development. If they barely scratched the surface or used 10 libraries for a 2-line task, roast gently but no need to deduct marks strictly.\n4. 💻 Code Quality & Language – Analyze code snippets. Judge actual quality: naming, structure, modularity, modern practices, and avoid blindly trusting what they claim. If it's messy or copy-pasted spaghetti code, say it.\n5. Explain appropriately (e.g., backend-only, or still in dev).\n\n🔥 Bonus Rules:\n- Be honest, even if it stings. These users can take it.\n- If the project is all fluff and no real build, call it out.\n- If it's actually impressive for a 7-month dev journey, praise it with proper respect.\n- College students usually only know frontend up to React — appreciate any real effort shown in backend, devops, design systems, Web3, TypeScript, testing, etc.\n\nKeep your responses concise but packed with value. Use 1–2 lines per criteria. End with a short verdict and a final score out of 100.\n\n. Also you might get dynamically your only previous response do consider that also and try to be very close to it considering the new analysis ${prevFeed}. Give the Final Rating as "Final Rating: your rating". The formatted project description starts after this colon:`;
      
      // Send to Gemini and get feedback
      const feedback = await sendToGeminiStream(instruction + formattedMessage);
      
      // Extract rating from feedback
      const ratingMatch = feedback.match(/Final Rating:\s*(\d+)/i) || 
                         feedback.match(/Final Score:\s*(\d+)/i);
      const rating = ratingMatch ? ratingMatch[1] : null;
      
      updateProgress("Saving project to database...");
      
    
      try {
        const response = await axios.post('/api/project', {
          githubUrl: projectDetails.githubUrl,
          techStack: projectDetails.techStack,
          projectType: projectDetails.projectType,
          demoUrl: projectDetails.demoUrl,
          description: projectDetails.description,
          teamMembers: projectDetails.teamMembers,
          challengesFaced: projectDetails.challengesFaced,
          userEmail: session?.user.email,
          feedback: feedback,
          rating: rating,
          title: selectedRepo
        });
        
        if (response.status === 201) {
          toast.success('Project saved to your portfolio with rating: ' + (rating || 'N/A'));
        }
        if (response.status === 200) {
          toast.success('Project updated with rating: ' + (rating || 'N/A'));
        }

      } catch (error) {
        console.error('Error saving project:', error);
        //@ts-expect-error: no need here
        if (error.response?.status === 409) {
          toast.error('You have already submitted this project');
        } else {
          toast.error('Failed to save project to database');
        }
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      addMessage({
        sender: 'ai',
        text: "Sorry, I encountered an error processing your request.",
        isCode: false
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false)
      toast.dismiss(toastId)
    }
  };



  const selectRepository = (repo: string) => {
    setSelectedRepo(repo);
    setProjectDetails(prev => ({
      ...prev,
      githubUrl: `https://github.com/${githubUsername}/${repo}`
    }));
  };



  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/[0.96] border border-white/10 rounded-xl shadow-2xl max-w-md w-full transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold -skew-x-12 text-white flex items-center">
                  <ProjectorIcon className="mr-2 text-[#2a5d75]" size={20} />
                  Submit Your Project
                </h1>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleProjectSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Github size={16} className="mr-2 text-[#2a5d75]" />
                      GitHub Repository URL <span className="text-red-400 ml-1">*</span>
                    </label>
                    
                    <div className="mb-2">
                      <input
                        type="url"
                        required
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm text-white"
                        placeholder="https://github.com/username/repo"
                        value={projectDetails.githubUrl}
                        readOnly
                        onChange={(e) => setProjectDetails({...projectDetails, githubUrl: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Button 
                        onClick={getRepos} 
                        className="flex items-center gap-1 bg-[#2a5d75] hover:bg-[#1d4254] text-white"
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
                      <div className="border border-white/10 rounded-lg p-2 max-h-40 overflow-y-auto mb-2 bg-white/5 backdrop-blur-lg">
                        <div className="text-sm mb-2 text-gray-400">Select a repository:</div>
                        <div className="grid grid-cols-1 gap-1">
                          {repos.map((repo) => (
                            <button
                              type="button"
                              key={repo}
                              onClick={() => selectRepository(repo)}
                              className={`text-left px-3 py-2 rounded-md text-sm flex items-center ${
                                selectedRepo === repo
                                  ? 'bg-[#2a5d75]/50 text-white font-medium'
                                  : 'hover:bg-white/10 text-gray-300'
                              }`}
                            >
                              <Github size={14} className="mr-2 text-gray-500" />
                              {repo}
                              {selectedRepo === repo && (
                                <CheckCircle size={14} className="ml-auto text-[#2a5d75]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Code size={16} className="mr-2 text-[#2a5d75]" />
                      Tech Stack <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm text-white"
                      placeholder="Next.js, TailwindCSS, Prisma, PostgreSQL"
                      value={projectDetails.techStack}
                      onChange={(e) => setProjectDetails({...projectDetails, techStack: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-[#2a5d75]" />
                      Project Type <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm text-white"
                      placeholder="E-commerce, SaaS, Portfolio"
                      value={projectDetails.projectType}
                      onChange={(e) => setProjectDetails({...projectDetails, projectType: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <Globe size={16} className="mr-2 text-[#2a5d75]" />
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm text-white"
                      placeholder="https://project.vercel.app"
                      value={projectDetails.demoUrl}
                      onChange={(e) => setProjectDetails({...projectDetails, demoUrl: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-[#2a5d75]" />
                      Project Description <span className="text-red-400 ml-1">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm resize-none text-white"
                      placeholder="A brief description of your project..."
                      value={projectDetails.description}
                      onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-[#2a5d75]" />
                      Team Members
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm text-white"
                      placeholder="List team members (or solo project)"
                      value={projectDetails.teamMembers}
                      onChange={(e) => setProjectDetails({...projectDetails, teamMembers: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                      <FileText size={16} className="mr-2 text-[#2a5d75]" />
                      Challenges Faced
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-[#2a5d75] focus:border-[#2a5d75] text-sm resize-none text-white"
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
                    className="w-full bg-[#2a5d75] hover:bg-[#1d4254] text-white py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
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