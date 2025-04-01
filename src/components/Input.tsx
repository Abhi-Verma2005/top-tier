import React, { useState } from "react";
import { GitGraphIcon, User } from "lucide-react";

function Input() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`fixed left-1/2 transform rounded-lg md:rounded-2xl -translate-x-1/2 w-3xl p-[2px] border-[3px] border-transparent bg-clip-padding bg-[#0f172a] 
      transition-all duration-500 ease-in-out 
      ${isFocused ? "bottom-0 h-28" : "bottom-60 h-28"}`}
    >
      {/* Gradient Border Layer */}
      <div 
        className={`absolute inset-0 rounded-lg md:rounded-2xl border-[3px] border-transparent transition-all duration-300 
        ${isFocused 
          ? "bg-gradient-to-r from-[#1d5d7a] via-[#6dc6ff] to-[#1d5d7a]" 
          : "bg-gradient-to-r from-[#0d2a38] via-[#2a5169] to-[#0d2a38]"}`} 
      />

      {/* Input Container */}
      <div className="relative w-full h-full rounded-2xl bg-[#0a0b0e] p-3 flex flex-col">
        <textarea
          className="w-full text-2xl text-white/60 placeholder:text-white/60 outline-none focus:ring-0 focus:border-transparent bg-transparent resize-none transition-all duration-500 ease-in-out"
          placeholder="Message M1"
          rows={2}
          onFocus={() => setIsFocused(true)} // Move to bottom on focus
          onBlur={() => setIsFocused(false)} // Move back when clicking elsewhere
        />
        <div className="flex mt-auto">
          <GitGraphIcon className="text-white/85 mx-1 size-5" />
          <User className="text-white/85 mx-1 size-5" />
        </div>
      </div>
    </div>
  );
}

export default Input;