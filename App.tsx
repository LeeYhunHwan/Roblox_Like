import React, { useState, useEffect } from 'react';
import Game3D from './components/Game3D';
import Interface from './components/Interface';
import { PlayerState, AvatarColors, ChatMessage, Vector3 } from './types';

// Initial data
const INITIAL_COLORS: AvatarColors = {
  head: '#eab308',
  torso: '#3b82f6',
  leftArm: '#eab308',
  rightArm: '#eab308',
  leftLeg: '#22c55e',
  rightLeg: '#22c55e',
};

// Mock other players for "Scalability" demo
const MOCK_PLAYERS: PlayerState[] = [
  {
    id: 'p2',
    name: 'BuildMaster99',
    position: { x: -5, y: 0, z: 5 },
    rotation: 0,
    colors: { ...INITIAL_COLORS, torso: '#ef4444', head: '#ffffff' },
    isNPC: true,
    action: 'idle'
  },
  {
    id: 'p3',
    name: 'Guest_1337',
    position: { x: 8, y: 0, z: -8 },
    rotation: 1,
    colors: { ...INITIAL_COLORS, leftLeg: '#000000', rightLeg: '#000000' },
    isNPC: true,
    action: 'walking'
  }
];

const App: React.FC = () => {
  // Local Player State
  const [playerState, setPlayerState] = useState<PlayerState>({
    id: 'local',
    name: 'Player1',
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    colors: INITIAL_COLORS,
    isNPC: false,
    action: 'idle'
  });

  // Other Players State
  const [otherPlayers, setOtherPlayers] = useState<PlayerState[]>(MOCK_PLAYERS);
  
  // UI State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'System', text: 'Welcome to BloxVerse AI! Customize your avatar or explore.', isSystem: true }
  ]);

  // Handle Local Movement Update
  const handleUpdatePosition = (newPos: Vector3, rot: number, isWalking: boolean, isJumping: boolean) => {
    setPlayerState(prev => ({
      ...prev,
      position: newPos,
      rotation: rot,
      action: isJumping ? 'jumping' : isWalking ? 'walking' : 'idle'
    }));
  };

  // Mock Multiplayer Logic: Randomly move other players
  useEffect(() => {
    const interval = setInterval(() => {
      setOtherPlayers(prev => prev.map(p => {
        // Simple random walk logic
        if (Math.random() > 0.95) {
             // Change direction or stop
             return { ...p, action: Math.random() > 0.5 ? 'walking' : 'idle' };
        }
        
        if (p.action === 'walking') {
            // Move vaguely in a circle or line
            const speed = 0.1;
            const newX = p.position.x + (Math.random() - 0.5) * speed;
            const newZ = p.position.z + (Math.random() - 0.5) * speed;
            // Bound checking for NPC
            return {
                ...p,
                position: { 
                    x: Math.abs(newX) > 40 ? p.position.x : newX, 
                    y: 0, 
                    z: Math.abs(newZ) > 40 ? p.position.z : newZ
                },
                rotation: p.rotation + 0.05
            };
        }
        return p;
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSetColors = (newColors: AvatarColors) => {
    setPlayerState(prev => ({ ...prev, colors: newColors }));
  };

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-900 select-none">
      
      {/* 3D Layer */}
      <Game3D 
        localPlayer={playerState} 
        otherPlayers={otherPlayers}
        onUpdatePosition={handleUpdatePosition}
      />

      {/* UI Layer */}
      <Interface 
        colors={playerState.colors}
        setColors={handleSetColors}
        playerName={playerState.name}
        isCustomizing={isCustomizing}
        setIsCustomizing={setIsCustomizing}
        messages={messages}
        addMessage={addMessage}
      />
    </div>
  );
};

export default App;
