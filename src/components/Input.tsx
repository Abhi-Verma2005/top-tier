import React, { useRef, useState } from "react";
import { GitGraphIcon, User } from "lucide-react";
import useInputStore from "@/store/messages";
import useMessageStore from "@/store/messages";
import { Button } from "./ui/button";

function Input() {
  const { input, setInput, sendMessage, isFocused, setIsFocused } = useMessageStore()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const handleInput = () => {
    const textArea = textAreaRef.current
    //@ts-expect-error: no need here.
    textArea.style.height = "auto"; // Reset height
    //@ts-expect-error: no need here.
    textArea.style.height = `${Math.min(textArea.scrollHeight, 150)}px`;

  }

  const handlekeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }


  return (
    <div
      className={`fixed left-1/2 transform rounded-lg md:rounded-2xl -translate-x-1/2 w-3xl p-[2px] border-[3px] border-transparent bg-clip-padding bg-[#0f172a] 
      transition-all duration-500 ease-in-out 
      ${isFocused ? "bottom-0" : "bottom-60"}`}
    >
      <div 
        className={`absolute inset-0 rounded-lg md:rounded-2xl border-[3px] border-transparent transition-all duration-300 
        ${isFocused 
          ? "bg-gradient-to-r from-[#1d5d7a] via-[#6dc6ff] to-[#1d5d7a]" 
          : "bg-gradient-to-r from-[#0d2a38] via-[#2a5169] to-[#0d2a38]"}`} 
      />

      <div className="relative w-full h-full rounded-2xl bg-[#0a0b0e] p-3 flex flex-col">
        <form onSubmit={() => sendMessage()}>
        <textarea
          ref={textAreaRef}
          className="w-full text-2xl h-12 text-white/60 placeholder:text-white/60 outline-none focus:ring-0 focus:border-transparent bg-transparent resize-none transition-all duration-500 ease-in-out"
          placeholder="Message M1"
          rows={1}
          value={input}
          onKeyDown={handlekeydown}
          onChange={(e) => setInput(e.target.value)}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)} 
        />
        </form>
        {/* <Button onClick={() => sendMessage()}>Send</Button> */}
        <div className="flex mt-auto py-1">
          <GitGraphIcon className="text-white/85 mx-1 size-5" />
          <User className="text-white/85 mx-1 size-5" />
        </div>
      </div>
    </div>
  );
}

export default Input;

