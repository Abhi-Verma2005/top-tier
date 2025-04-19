import React, { useRef, useState } from "react";
import { GitGraphIcon, User, Send, Paperclip } from "lucide-react";
import useMessageStore from "@/store/messages";
import toast from "react-hot-toast";
import { connect } from "./Helpers/Fetch";

function Input() {
  const { input, setInput, sendMessage, isFocused, setIsFocused, setShowModal } = useMessageStore();
  const textAreaRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
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

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 w-full max-w-3xl p-[2px]
        transition-all duration-300 ease-out rounded-xl
        ${isFocused ? "bottom-6" : "bottom-60"}`}
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
            <textarea
              ref={textAreaRef}
              className="w-full px-3 py-2 text-base font-light text-zinc-300 placeholder:text-zinc-600
                outline-none focus:ring-0 focus:border-transparent
                rounded-lg resize-none font-sans"
              placeholder="Message Zero..."
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

            <button onClick={()=>{
              const token = localStorage.getItem('githubAccessToken')
              if(token){
                setShowModal(true)
              }
              if(!token){
                toast.error('Token not found, first connect your github')
                connect()
              }
            }} className="p-1 flex justify-center items-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
              <span className="mx-1">Rate</span><GitGraphIcon className="size-4" />
            </button>
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