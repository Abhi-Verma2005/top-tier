"use client"
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, User, ArrowRight, Github } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import img3 from '@/images/signin.png';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const Router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      });
      
      if (!result) {
        toast.error('Please check credentials, and try again.');
        return;
      }
      
      if (result.error) {
        toast.error('Please check credentials, and try again.');
        return;
      }

      if(result.url) {
        toast.success('Signed In Successfully');
        setTimeout(()=>{
          Router.push('/');
        }, 1000)
      }
      
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('github', { callbackUrl: '/' });
    } catch (error) {
      console.error(error);
      toast.error('SignIn with GitHub failed, Try again!');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] flex items-center justify-center p-4 relative overflow-hidden">
      
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <CardHeader className="text-center pb-2 border-b border-white/10">
            <div className="mx-auto mb-4">
              <Image 
                src={img3} 
                alt="Sign In" 
                width={120} 
                height={120} 
                className="mx-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold -skew-x-12 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Enter & Explore <span className="text-[#2a5d75]">TopTier</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#2a5d75]" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isLoading}
                  className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#2a5d75]" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#2a5d75] hover:bg-[#1d4254] text-white font-medium flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/50 text-gray-400">OR</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={handleGithubSignIn}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              disabled={isLoading}
            >
              <Github className="h-5 w-5" />
              {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}