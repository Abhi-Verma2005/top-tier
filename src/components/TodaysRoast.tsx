'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, RefreshCw, Code, Sparkles } from 'lucide-react';
import gemini from '@/images/zero.png';
import useMessageStore from '@/store/messages';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';

// Define the roast response type
interface RoastResponse {
  roasts: string[];
  title?: string;
}

const TodaysRoast: React.FC = () => {
  const { isFocused } = useMessageStore();
  const [roasts, setRoasts] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("Today's Roast");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
    setIsLoading(true);
    try {
      // Using the same Gemini API function pattern you provided in your example
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const instruction = `Generate 2-3 brutally honest, sarcastic one-liner roasts about a developer's coding habits or practices. Make them funny but not mean-spirited. Format the response as valid JSON with a 'roasts' array and an optional creative 'title' field. Example format: 
      {
        "roasts": ["Your code has more bugs than a tropical rainforest.", "Your variable naming is like your dating life - inconsistent and confusing."],
        "title": "Code Catastrophe Corner"
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
        if (parsedResponse.title) {
          setTitle(parsedResponse.title);
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        console.error("Response text:", responseText);
        console.error("Extracted JSON string:", jsonString);
        setRoasts(["Your JSON parsing skills are as reliable as your code comments."]);
      }
    } catch (err) {
      console.error("Error generating roasts:", err);
      setRoasts(["Even AI can't roast code as broken as this connection."]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    generateRoastsFromGemini();
  }, []);

  if (isFocused) {
    return null; // Don't render when input is focused
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 max-w-[80%] w-full"
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="mt-1 bg-blue-500/20 p-2 rounded-lg">
            <Image src={gemini} alt="Zero" className="size-8 rounded-lg" />
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-bold text-blue-400 flex items-center">
                <Code size={16} className="mr-2" />
                {title}
                <Sparkles size={14} className="ml-2 text-yellow-400" />
              </h3>
              <button 
                onClick={generateRoastsFromGemini}
                className="ml-auto bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-all"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={`text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-2">
                <div className="h-5 bg-gray-700 rounded animate-pulse mb-3 w-3/4"></div>
                <div className="h-5 bg-gray-700 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {roasts.map((roast, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.2 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3"
                    >
                      <p className="text-gray-200 text-sm font-medium">
                        <span className="text-blue-400 font-bold mr-2">#</span>
                        {roast}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodaysRoast;