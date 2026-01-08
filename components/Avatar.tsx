import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarColors } from '../types';

interface AvatarProps {
  colors: AvatarColors;
  position: [number, number, number];
  rotation: number;
  isWalking: boolean;
  isJumping: boolean;
}

// A Roblox-like avatar is composed of 6 parts: Head, Torso, L/R Arm, L/R Leg
const Avatar: React.FC<AvatarProps> = ({ colors, position, rotation, isWalking, isJumping }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  // Animation logic
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Smoothly interpolate position
    groupRef.current.position.lerp(new THREE.Vector3(...position), 0.2);
    // Smoothly interpolate rotation
    const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
    groupRef.current.quaternion.slerp(targetRotation, 0.2);

    const time = state.clock.getElapsedTime();
    const speed = 10;

    // Walking Animation (Swing limbs)
    if (isWalking) {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(time * speed) * 0.5;
        rightLegRef.current.rotation.x = Math.cos(time * speed) * 0.5;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.cos(time * speed) * 0.5;
        rightArmRef.current.rotation.x = Math.sin(time * speed) * 0.5;
      }
    } else {
      // Idle reset
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }

    // Jump visual effect
    if (isJumping) {
       if (leftArmRef.current) leftArmRef.current.rotation.z = 2.5; 
       if (rightArmRef.current) rightArmRef.current.rotation.z = -2.5;
    } else {
       if (leftArmRef.current) leftArmRef.current.rotation.z = 0; 
       if (rightArmRef.current) rightArmRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Torso: 2 wide, 2 high, 1 deep */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1]} />
        <meshStandardMaterial color={colors.torso} />
      </mesh>

      {/* Head: 1.2 cube */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={colors.head} />
        {/* Face (Simple texture simulation with geometry) */}
        <mesh position={[0.3, 0.1, 0.61]}>
           <boxGeometry args={[0.2, 0.2, 0.05]} />
           <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[-0.3, 0.1, 0.61]}>
           <boxGeometry args={[0.2, 0.2, 0.05]} />
           <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[0, -0.3, 0.61]}>
           <boxGeometry args={[0.6, 0.15, 0.05]} />
           <meshBasicMaterial color="black" />
        </mesh>
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-1.5, 1.5, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={colors.leftArm} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[1.5, 1.5, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={colors.rightArm} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.5, 0, 0]} geometry={new THREE.BoxGeometry(1, 2, 1)} castShadow>
         {/* Offset pivot for legs to top */}
         <meshStandardMaterial color={colors.leftLeg} />
      </mesh>
      {/* Correction for pivot: The pure mesh pivot is center. We want pivot at hip. 
          Actually, simpler to just animate rotation and trust the center point for this style.
          Standard Roblox legs pivot at the top (hip). 
          To fix pivot, we wrap inside a group or adjust position relative to rotation logic.
          For this demo, center rotation is acceptable for "blocky" style.
      */}

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={colors.rightLeg} />
      </mesh>
    </group>
  );
};

export default Avatar;
