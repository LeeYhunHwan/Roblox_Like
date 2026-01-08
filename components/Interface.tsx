import React, { useState, useEffect, useRef } from 'react';
import { AvatarColors, ChatMessage } from '../types';
import { generateNPCResponse, generateWorldLore } from '../services/geminiService';
import { Send, User, Menu, X, Palette, MessageSquare } from 'lucide-react';

interface InterfaceProps {
  colors: AvatarColors;
  setColors: (c: AvatarColors) => void;
  playerName: string;
  isCustomizing: boolean;
  setIsCustomizing: (v: boolean) => void;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', 
  '#ffffff', '#9ca3af', '#374151', '#000000', '#78350f'
];

const BODY_PARTS: { key: keyof AvatarColors; label: string }[] = [
  { key: 'head', label: 'Head' },
  { key: 'torso', label: 'Torso' },
  { key: 'leftArm', label: 'Left Arm' },
  { key: 'rightArm', label: 'Right Arm' },
  { key: 'leftLeg', label: 'Left Leg' },
  { key: 'rightLeg', label: 'Right Leg' },
];

const Interface: React.FC<InterfaceProps> = ({ 
  colors, setColors, playerName, isCustomizing, setIsCustomizing, messages, addMessage 
}) => {
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<keyof AvatarColors>('torso');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [serverNotice, setServerNotice] = useState("");

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  // Initial Server Lore
  useEffect(() => {
      generateWorldLore().then(lore => setServerNotice(lore));
  }, []);

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: playerName,
      text: chatInput,
      isSystem: false
    };
    addMessage(userMsg);
    setChatInput('');

    // Check if player is talking to AI (simple heuristic: implies question or mentions "bot", "admin", "npc")
    // Or just always respond occasionally to simulate a lively server.
    if (Math.random() > 0.3 || chatInput.toLowerCase().includes('hello')) {
      const reply = await generateNPCResponse(playerName, userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'BloxBot_AI',
        text: reply,
        isSystem: false
      };
      addMessage(botMsg);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      
      {/* Top HUD */}
      <div className="p-4 flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-2">
            <div className="bg-black/60 text-white px-4 py-2 rounded-lg font-bold backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <User size={18} /> {playerName}
            </div>
            {serverNotice && (
                 <div className="bg-blue-600/80 text-white text-xs px-3 py-1 rounded max-w-sm animate-pulse">
                    SERVER: {serverNotice}
                 </div>
            )}
        </div>
        
        <button 
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition-all"
        >
          {isCustomizing ? <X /> : <Palette />}
        </button>
      </div>

      {/* Customization Modal */}
      {isCustomizing && (
        <div className="absolute top-20 right-4 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 pointer-events-auto shadow-2xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Palette size={16}/> Avatar Editor
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {BODY_PARTS.map(part => (
              <button
                key={part.key}
                onClick={() => setActiveTab(part.key)}
                className={`text-xs px-2 py-1 rounded ${activeTab === part.key ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {part.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className={`w-10 h-10 rounded-full border-2 ${colors[activeTab] === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'} transition-all`}
                onClick={() => setColors({ ...colors, [activeTab]: color })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Area: Chat */}
      <div className="p-4 flex flex-col items-start gap-2 pointer-events-auto">
         {/* Chat Toggle (Mobile/Minimalist) */}
         <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="md:hidden bg-black/50 text-white p-2 rounded-full"
         >
            <MessageSquare size={20} />
         </button>

         {/* Chat Box */}
         <div className={`
             bg-black/60 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-md flex flex-col
             transition-all duration-300 origin-bottom-left
             ${isChatOpen ? 'opacity-100 scale-100 h-64' : 'opacity-0 scale-95 h-0 md:opacity-100 md:scale-100 md:h-64'}
         `}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className={`font-bold ${msg.sender === 'BloxBot_AI' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {msg.sender}:
                  </span>
                  <span className="text-white ml-2">{msg.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendChat} className="p-2 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Press Enter to chat..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
              />
              <button type="submit" className="text-blue-400 hover:text-blue-300">
                <Send size={16} />
              </button>
            </form>
         </div>

         <div className="text-white/30 text-xs mt-1">
            WASD to Move • SPACE to Jump • Arrows to Rotate
         </div>
      </div>

    </div>
  );
};

export default Interface;
