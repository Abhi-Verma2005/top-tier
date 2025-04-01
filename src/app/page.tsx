"use client";
import Input from "@/components/Input";
import { Cover } from "@/components/ui/cover";
import { FlipWords } from "@/components/ui/flip-words";
import { Spotlight } from "@/components/ui/spotlight-new";
import React from "react";

export default function Home() {
  const words = ["Rankings", "Competition", "Achievements", "Growth", "Skill Mastery"];

  return (
    <>
      <div className="h-screen flex-col w-full flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className="fixed top-1 left-24 transform -translate-x-1/2 z-50">
        <h1 className="text-2xl font-bold md:text-3xl lg:text-3xl -skew-x-12 max-w-7xl text-center relative z-20 p-1 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
          <Cover>TopTier</Cover>
        </h1>
      </div>
        <Spotlight />
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            TopTier<span className="text-[#2a5d75]">.dev</span>
          </h1>
          <h1 className="text-3xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            Fair College <span className="inline-block"><FlipWords words={words} /></span>
          </h1>
        </div>
        <Input/>
      </div>
    </>
  );
}