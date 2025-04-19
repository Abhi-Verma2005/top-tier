'use client'
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Settings,
  FolderOpen,
  MessageCircle
} from 'lucide-react';
import { Cover } from './ui/cover';
import { Spotlight } from '@/components/ui/spotlight-new';
import useMessageStore from '@/store/messages';
import useTokenStore from '@/store/token';

const Navbar = () => {
  const router = useRouter();
  const { data:session, status } = useSession();
  const [username, setUsername] = useState('');
  const { setIsFocused } = useMessageStore()
  const { token, setToken } = useTokenStore()

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const usernameResponse =  session?.user.email.split('.')[0].toUpperCase()
        if(usernameResponse){
          setUsername(usernameResponse);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    if (status === 'authenticated') {
      checkUsername();
    }
  }, [status]);
  
  useEffect(() => {
    const accessToken = localStorage.getItem('githubAccessToken')
    if(accessToken){
      setToken(accessToken)
    }
  }, []);

  const handleSignOut = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const navigateToProjects = () => {
    router.push('/projects');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 md:px-8 bg-transparent">
      <div className="flex items-center space-x-4 relative">
        <Link href={'/'}>
          <div className="relative">
            <h1 onClick={() => setIsFocused(false)} className="text-2xl font-bold md:text-3xl lg:text-3xl -skew-x-12 max-w-7xl text-center relative z-20 p-1 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              <Cover>TopTier<span className="text-[#2a5d75]">.dev</span></Cover>
            </h1>
            <div className="absolute inset-0 -z-10 opacity-40">
              <Spotlight />
            </div>
          </div>
        </Link>
      </div>

      {status === 'authenticated' ? (
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link 
            href={!token ? `/chat/false` : `/chat/true/${token}`}
            className="mr-2"
          >
            <Button 
              variant="outline" 
              className="border-white/10 hover:bg-white/5 hover:border-white/20 flex items-center gap-2 px-3 text-neutral-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline-block">Chat</span>
            </Button>
          </Link>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:border-white/20 flex items-center gap-2 px-3 text-neutral-200">
                  <div className="h-8 w-8 bg-gradient-to-r from-[#2a5d75] to-[#1d4254] rounded-full flex items-center justify-center text-white font-medium">
                    {username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black/95 border border-white/10 shadow-xl rounded-lg p-1">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-neutral-200">Hi, {username}</p>
                    <p className="text-xs text-neutral-400">Logged in</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem 
                  className="px-3 py-2 hover:bg-white/5 cursor-pointer" 
                  onClick={navigateToProjects}
                >
                  <FolderOpen className="mr-2 h-4 w-4 text-neutral-300" />
                  <span className="text-neutral-200 font-medium">My Projects</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem 
                  className="px-3 py-2 hover:bg-red-900/20 cursor-pointer" 
                  //@ts-expect-error: don't know what to do here
                  onSelect={(e) => handleSignOut(e)}
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Link 
            href={!token ? `/chat/false` : `/chat/true/${token}`}
          >
            <Button 
              variant="outline" 
              className="border-white/10 hover:bg-white/5 hover:border-white/20 flex items-center gap-2 px-3 text-neutral-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </Button>
          </Link>
          
          <Button 
            variant="default" 
            onClick={() => signIn()} 
            className="bg-[#2a5d75] hover:bg-[#1d4254] text-white shadow-md transition-all flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;