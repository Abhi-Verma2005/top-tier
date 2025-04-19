"use client";
import React, { useEffect } from "react";
import ChatComponent from "@/components/Chat";
import Input from "@/components/Input";
import { FlipWords } from "@/components/ui/flip-words";
import { Spotlight } from "@/components/ui/spotlight-new";
import useMessageStore from "@/store/messages";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Chat() {
  const Router = useRouter();
  const { status } = useSession();
  const words = ["Rankings", "Competition", "Achievements", "Growth", "Skill Mastery"];
  const { isFocused } = useMessageStore();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/auth/signin');
    }
  }, [status]);

  return (
    <>
      <div className="h-screen flex-col w-full flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        
        {!isFocused && (
          <>
            <Spotlight />
            <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
              <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                TopTier<span className="text-[#2a5d75]">.dev</span>
              </h1>
              <h1 className="text-3xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                Fair College <span className="inline-block"><FlipWords words={words} /></span>
              </h1>
            </div>
          </>
        )}
        
        {isFocused && <ChatComponent />}
        
        <Input />
      </div>
    </>
  );
}