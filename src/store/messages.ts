import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  isCode?: boolean;
}

interface MessageState {
  messages: Message[];
  addMessage: (message: Partial<Message>) => Message;
  input: string;
  setInput: (text: string) => void;
  showModal: boolean
  setShowModal: (value: boolean) => void
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  currentStreamingMessage: string | null,
  sendMessage: () => Promise<void>;
  handleAIResponse: (userMessage: string) => Promise<void>;
  latestAIMessageId: string | null;
  sendToGeminiStream: (userMessage: string) => Promise<string>
}
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const useMessageStore = create<MessageState>((set, get) => ({
  
  sendToGeminiStream: async (userMessage: string) => {
    const aiMessageId = Date.now() + 1 + '';
    let fullText = '';
  
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: aiMessageId,
          text: '',
          sender: 'ai',
          timestamp: new Date()
        }
      ],
      currentStreamingMessage: aiMessageId
    }));
  
    try {
      function beautifyPlainText(text: string): string {
        let clean = text.replace(/\*\*(.*?)\*\*/g, '$1');
        clean = clean.replace(/\*(.*?)\*/g, '$1');
        return clean;
      }
  
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const responseStream = await model.generateContentStream(userMessage);
  
      for await (const chunk of responseStream.stream) {
        const textChunk = beautifyPlainText(chunk.text());
        fullText += textChunk;
  
        set((state) => {
          const updatedMessages = state.messages.map(msg => {
            if (msg.id === state.currentStreamingMessage) {
              return { ...msg, text: msg.text + textChunk };
            }
            return msg;
          });
  
          return { messages: updatedMessages };
        });
      }
  
      return fullText;
  
    } catch (error) {
      console.error("Streaming error:", error);
  
      const errorMessage = "Error: Could not process your request.";
      set((state) => {
        const updatedMessages = state.messages.map(msg => {
          if (msg.id === state.currentStreamingMessage) {
            return { ...msg, text: errorMessage };
          }
          return msg;
        });
  
        return { messages: updatedMessages };
      });
  
      return errorMessage;
  
    } finally {
      set({ isLoading: false, currentStreamingMessage: null });
    }
  },
  messages: [],
  showModal: false,
  setShowModal: (value: boolean) => set({ showModal: value }),
  currentStreamingMessage: null,
  addMessage: (messageData: Partial<Message>) => {
    const message: Message = {
      id: messageData.id || uuidv4(),
      text: messageData.text || '',
      sender: messageData.sender || 'user',
      timestamp: messageData.timestamp || new Date(),
      isCode: messageData.isCode || false
    };
    set((state) => ({
      messages: [...state.messages, message]
    }));
    return message;
  },
  input: '',
  setInput: (text) => set({ input: text }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  isFocused: false,
  setIsFocused: (focused) => set({ isFocused: focused }),
  latestAIMessageId: null,

  sendMessage: async () => {
    const { input, setInput, handleAIResponse } = get();
    if (!input.trim()) return;

    const messageText = input;
    setInput('');
    await handleAIResponse(messageText);
  },

  handleAIResponse: async (userMessage: string) => {
    const { addMessage, setIsLoading, sendToGeminiStream } = get();

    if (!userMessage.trim()) return;

    addMessage({
      sender: 'user',
      text: userMessage,
      isCode: false
    });

    setIsLoading(true);

    try {
      await sendToGeminiStream(userMessage)
    } catch (error) {
      console.error('AI Response Error:', error);
      addMessage({
        sender: 'ai',
        text: "Sorry, I encountered an error processing your request.",
        isCode: false
      });
      setIsLoading(false);
    }
  }
}));

export default useMessageStore;