export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface AvatarColors {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
}

export interface PlayerState {
  id: string;
  name: string;
  position: Vector3;
  rotation: number; // Y-axis rotation
  colors: AvatarColors;
  isNPC: boolean;
  action: 'idle' | 'walking' | 'jumping';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
}
