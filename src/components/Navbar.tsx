'use client'
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Trophy, 
  Brain,
  Swords, 
  Info,
  LogOut, 
  Settings,
  ShieldCheck,
  ChartNoAxesColumnIcon,
  UserCog
} from 'lucide-react';
import { Cover } from './ui/cover';
import { Spotlight } from '@/components/ui/spotlight-new';
import useMessageStore from '@/store/messages';
import useTokenStore from '@/store/token';

const Navbar = () => {
  const router = useRouter();
  const { status } = useSession();
  const [username, setUsername] = useState('');
  const { setIsFocused } = useMessageStore()
  const { token, setToken } = useTokenStore()

  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const [usernameResponse] = await Promise.all([
          axios.post('/api/getUsername')
        ]);
        
        setUsername(usernameResponse.data.username);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (status === 'authenticated') {
      checkIfAdmin();
    }
  }, [status]);
  
  useEffect(() => {
    const accessToken = localStorage.getItem('githubAccessToken')
    if(accessToken){
      setToken(accessToken)
    }
  }, []);

  const navigationItems = [
    { href: `/chat/${token ? 'true/' + token : 'false'} `, label: 'Chat', icon: Trophy, color: 'text-yellow-400' },
    { href: '/arena', label: 'Arena', icon: Swords, color: 'text-red-400' },
  ];

  const handleSignOut = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 md:px-8 bg-transparent">
      <div className="flex items-center space-x-4 relative">
        <Link href={'/'}>
          <div className="relative">
            <h1 onClick={() => setIsFocused(false)} className="text-2xl font-bold md:text-3xl lg:text-3xl -skew-x-12 max-w-7xl text-center relative z-20 p-1 bg-clip-text text-transparent bg-gradient-to-b from-neutral-300 via-white to-neutral-300 dark:from-neutral-300 dark:via-white dark:to-neutral-300">
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
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="flex items-center space-x-1 hover:bg-white/5 text-neutral-200 hover:text-white transition-colors">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:border-white/20 flex items-center gap-2 px-3 text-neutral-200">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-800 rounded-full flex items-center justify-center text-white font-medium">
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
                
                <div className="md:hidden py-1">
                  {navigationItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <DropdownMenuItem className="px-3 py-2 hover:bg-white/5 cursor-pointer text-neutral-300">
                        <item.icon className={`mr-2 h-4 w-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    </Link>
                  ))}
                  <DropdownMenuSeparator className="bg-white/10" />
                </div>

                {true && (
                  <>
                    <Link href="/admin/dashboard">
                      <DropdownMenuItem className="px-3 py-2 hover:bg-white/5 cursor-pointer text-neutral-300">
                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-400" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/admin/Stats">
                      <DropdownMenuItem className="px-3 py-2 hover:bg-white/5 cursor-pointer text-neutral-300">
                        <ChartNoAxesColumnIcon className="mr-2 h-4 w-4 text-teal-400" />
                        <span>Stats</span>
                      </DropdownMenuItem>
                    </Link>
                   
                    <DropdownMenuSeparator className="bg-white/10" />
                  </>
                )}
                 <Link href={token ? '/chat/true' : '/chat/false'}>
                      <DropdownMenuItem className="px-3 py-2 hover:bg-white/5 cursor-pointer text-neutral-300">
                        <Brain className="mr-2 h-4 w-4 text-purple-400" />
                        <span>Chat/Rate with Gemini</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href='/about'>
                      <DropdownMenuItem className="px-3 py-2 hover:bg-white/5 cursor-pointer text-neutral-300">
                        <Info className="mr-2 h-4 w-4 text-cyan-400" />
                        <span>About AlgoJourney</span>
                      </DropdownMenuItem>
                    </Link>
                
                <Link href={`/user/updateProfile/${username}`}>
                  <DropdownMenuItem className="px-3 py-2 hover:bg-white/5 cursor-pointer text-neutral-300">
                    <UserCog className="mr-2 h-4 w-4 text-neutral-400" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                
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
        <Button 
          variant="default" 
          onClick={() => signIn()} 
          className="bg-gradient-to-r from-blue-600 to-indigo-800 hover:from-blue-700 hover:to-indigo-900 text-white shadow-md transition-all flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Sign In</span>
        </Button>
      )}
    </nav>
  );
};

export default Navbar;