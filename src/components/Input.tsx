import React, { useRef, useState, useEffect } from "react";
import { GitGraphIcon, Send } from "lucide-react";
import useMessageStore from "@/store/messages";
import toast from "react-hot-toast";
import Image from 'next/image';
import gemini from '@/images/zero.png';
import { GoogleGenerativeAI } from '@google/generative-ai';
import useTokenStore from "@/store/token";
import { useSession } from "next-auth/react";

// Define the roast response type
interface RoastResponse {
  roasts: string[];
  title?: string;
}

function Input() {
  const { input, setInput, sendMessage, isFocused, setIsFocused, setShowModal } = useMessageStore();
  const textAreaRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Roast state
  const [roasts, setRoasts] = useState<string[]>([]);
  const { data: session } = useSession()
  const [currentRoastIndex, setCurrentRoastIndex] = useState(0);
  const [isLoadingRoast, setIsLoadingRoast] = useState(true);
  
  const handleInput = () => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    //@ts-expect-error: no need here
    textArea.style.height = "auto";
    //@ts-expect-error: no need here
    textArea.style.height = `${Math.min(textArea.scrollHeight, 150)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = input.trim() === '';

  // Helper function to extract JSON from potential markdown code blocks
  const extractJsonFromResponse = (text: string): string => {
    // Check if the response is wrapped in markdown code blocks
    const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonCodeBlockRegex);
    
    // If it matches the pattern, return just the JSON content
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Otherwise return the original text
    return text.trim();
  };
  
  const generateRoastsFromGemini = async () => {
    setIsLoadingRoast(true);
    try {
      // Using the Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const instruction = `Generate 2-3 brutally honest, sarcastic one-liner roasts about a developer's coding habits or practices. Make them funny but not mean-spirited. Format the response as valid JSON with a 'roasts' array. Example format: 
      {
        "roasts": ["Your code has more bugs than a tropical rainforest.", "Your variable naming is like your dating life - inconsistent and confusing."]
      }
      Just return the JSON with no additional text or explanations.`;
      
      const result = await model.generateContent(instruction);
      const aiResponse = result.response;
      const responseText = aiResponse.text();
      
      // Extract JSON from the response, handling markdown code blocks if present
      const jsonString = extractJsonFromResponse(responseText);
      
      // Parse the JSON response
      try {
        const parsedResponse: RoastResponse = JSON.parse(jsonString);
        setRoasts(parsedResponse.roasts);
        setCurrentRoastIndex(0); // Reset to first roast
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        setRoasts(["Your JSON parsing skills are as reliable as your code comments."]);
      }
    } catch (err) {
      console.error("Error generating roasts:", err);
      setRoasts(["Even AI can't roast code as broken as this connection."]);
    } finally {
      setIsLoadingRoast(false);
    }
  };
  
  // Rotate through roasts when not focused
  useEffect(() => {
    if (!isFocused && roasts.length > 0) {
      const interval = setInterval(() => {
        setCurrentRoastIndex((prevIndex) => (prevIndex + 1) % roasts.length);
      }, 5000); // Change roast every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [isFocused, roasts.length]);
  
  // Generate roasts initially and when returning to unfocused state
  useEffect(() => {
    if (!isFocused) {
      generateRoastsFromGemini();
    }
  }, [isFocused]);

  // Get current placeholder text
  const getPlaceholderText = () => {
    if (isFocused) return "Message Zero...";
    if (isLoadingRoast) return "Loading today's roast...";
    if (roasts.length > 0) return `"${roasts[currentRoastIndex]}"`;
    return "Message Zero...";
  };

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 w-full max-w-3xl p-[2px]
        transition-all duration-500 ease-out rounded-xl
        ${isFocused ? "bottom-6" : "bottom-56"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient border */}
      <div 
        className={`absolute inset-0 rounded-xl border-[2px] border-transparent transition-all duration-300 
        ${isFocused 
          ? "bg-gradient-to-r from-[#1d5d7a] via-[#6dc6ff] to-[#1d5d7a]" 
          : isHovered
            ? "bg-gradient-to-r from-[#1d5d7a80] via-[#6dc6ff80] to-[#1d5d7a80]"
            : "bg-gradient-to-r from-[#0d2a38] via-[#2a5169] to-[#0d2a38]"}`} 
      />

      <div className="relative w-full h-full rounded-xl bg-[#0c0c0c] p-3">
        {/* Text area container */}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="w-full">
          <div className="relative">
            {/* Show Gemini icon for roast when not focused */}
            {!isFocused && (
              <div className="absolute left-3 top-3 flex items-center">
                <Image 
                  src={gemini} 
                  alt="Zero" 
                  className="size-4 rounded-lg mr-2" 
                />
                <span className="text-xs font-medium text-[#2a5d75]">Click to type</span>
              </div>
            )}
            
            <textarea
              ref={textAreaRef}
              className={`w-full px-3 py-2 text-base font-light text-zinc-300 
                ${!isFocused ? 'pt-9 text-sm italic text-zinc-400' : 'placeholder:text-zinc-600'}
                outline-none focus:ring-0 focus:border-transparent
                rounded-lg resize-none font-sans transition-all duration-300`}
              placeholder={getPlaceholderText()}
              rows={1}
              value={input}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
            />
            
            {/* Send button */}
            <button 
              type="submit" 
              disabled={isEmpty}
              className={`absolute right-2 bottom-2 p-1.5 rounded-md transition-all duration-200
                ${isEmpty 
                  ? "bg-zinc-800 text-zinc-600" 
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
            >
              <Send size={16} className={isEmpty ? "opacity-50" : "opacity-100"} />
            </button>
          </div>
        </form>

        {/* Toolbar */}
        <div className="flex items-center mt-2 px-1">
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => {
                const token = session?.user.githubAccessToken
                if(token) {
                  setShowModal(true);
                }
                if(!token) {
                  toast.error('Token not found, try re logging in');
                }
              }} 
              className="p-1 flex justify-center items-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <span className="mx-1">Rate</span><GitGraphIcon className="size-4" />
            </button>
            
            {/* Only show refresh roast button when not focused */}
            {!isFocused && (
              <button 
                onClick={generateRoastsFromGemini}
                className="p-1 ml-2 flex justify-center items-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
                disabled={isLoadingRoast}
              >
                <span className="mx-1">New Roast</span>
                <svg
                  className={`size-4 ml-1 ${isLoadingRoast ? 'animate-spin' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="ml-auto text-xs text-zinc-600 font-medium">
            {input.length > 0 && `${input.length} characters`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Input;