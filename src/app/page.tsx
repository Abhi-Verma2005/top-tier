'use client'
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { ArrowDown, Code, Search, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Index = () => {
  const { status } = useSession()
  const Router = useRouter()
  const token = localStorage.getItem("githubAccessToken")
  useEffect(() => {
    if(!token) return 
    if(status === "unauthenticated") return 
    Router.push(`/chat/true/${token}`)
  }, [])

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight/>

      {/* Hero Section */}
      <div className="relative pt-24 px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-7xl -skew-x-12 font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              TopTier<span className="text-[#2a5d75]">.dev</span>
            </h1>
            <div className="animate-fade-in mt-6 text-lg md:text-xl text-gray-400">
              Meet Zero, your brutally honest AI code critic
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href={!token ? `/chat/false` : `/chat/true/${token}`}>
              <Button
                className="bg-[#2a5d75] hover:bg-[#1d4254] text-white px-8 py-6 text-lg rounded-xl"
              >
                Try Zero AI <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Code className="h-8 w-8 text-[#2a5d75]" />}
              title="Deep Code Analysis"
              description="Zero AI dissects your GitHub repos with surgical precision, spotting good practices and potential improvements."
            />
            <FeatureCard
              icon={<Search className="h-8 w-8 text-[#2a5d75]" />}
              title="Real Insights"
              description="Get honest feedback about your code quality, project structure, and development practices."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-[#2a5d75]" />}
              title="Student Focused"
              description="Tailored for college projects, helping you understand if your work truly stands out."
            />
          </div>
        </div>
      </div>

      {/* Sample Roasts Section */}
      <div className="relative px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Sample Roasts by Zero
          </h2>
          <div className="space-y-6">
            <RoastCard
              title="Portfolio Website"
              roast="Nice Bootstrap template you got there... I mean, your 'custom design'. At least you changed the colors! 🎨"
            />
            <RoastCard
              title="Todo App"
              roast="Ah yes, another todo app. Because the world definitely needed one more. But hey, at least your code is clean! 📝"
            />
            <RoastCard
              title="Chat Application"
              roast="WebSockets? Never heard of them? Your polling every 100ms is... an interesting choice. Let's talk about real-time! 💬"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors">
    <div className="flex flex-col items-center text-center">
      {icon}
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  </div>
);

const RoastCard = ({ title, roast }: { title: string; roast: string }) => (
  <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10">
    <h3 className="text-lg font-semibold text-[#2a5d75]">{title}</h3>
    <p className="mt-2 text-gray-400">{roast}</p>
  </div>
);

export default Index;