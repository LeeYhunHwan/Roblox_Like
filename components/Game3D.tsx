import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Avatar from './Avatar';
import { PlayerState, Vector3 } from '../types';

interface Game3DProps {
  localPlayer: PlayerState;
  otherPlayers: PlayerState[];
  onUpdatePosition: (newPos: Vector3, rot: number, isWalking: boolean, isJumping: boolean) => void;
}

const FLOOR_SIZE = 100;

// Camera Follow Component
const CameraController: React.FC<{ targetPosition: Vector3 }> = ({ targetPosition }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      // Smoothly move controls target to player
      controlsRef.current.target.lerp(new THREE.Vector3(targetPosition.x, targetPosition.y + 1, targetPosition.z), 0.1);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={false}
      minDistance={5}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under floor
    />
  );
};

// Main Scene Content
const Scene: React.FC<Game3DProps> = ({ localPlayer, otherPlayers, onUpdatePosition }) => {
  // Input State
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Physics State (Mock)
  const position = useRef(new THREE.Vector3(localPlayer.position.x, localPlayer.position.y, localPlayer.position.z));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const rotation = useRef(localPlayer.rotation);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 10 * delta;
    const rotateSpeed = 3 * delta;
    let isWalking = false;

    // Rotation (Left/Right)
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
      rotation.current += rotateSpeed;
    }
    if (keys.current['KeyD'] || keys.current['ArrowRight']) {
      rotation.current -= rotateSpeed;
    }

    // Forward/Backward Vector
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current);

    // Movement
    if (keys.current['KeyW'] || keys.current['ArrowUp']) {
      position.current.addScaledVector(direction, speed);
      isWalking = true;
    }
    if (keys.current['KeyS'] || keys.current['ArrowDown']) {
      position.current.addScaledVector(direction, -speed);
      isWalking = true;
    }

    // Jumping
    if (keys.current['Space'] && isGrounded.current) {
      velocity.current.y = 15 * delta; // Jump force
      isGrounded.current = false;
    }

    // Gravity
    if (!isGrounded.current) {
      velocity.current.y -= 30 * delta * delta; // Gravity
      position.current.y += velocity.current.y;

      // Floor collision
      if (position.current.y <= 0) {
        position.current.y = 0;
        velocity.current.y = 0;
        isGrounded.current = true;
      }
    } else {
       position.current.y = 0;
    }
    
    // Bounds check
    if (position.current.x > FLOOR_SIZE / 2) position.current.x = FLOOR_SIZE / 2;
    if (position.current.x < -FLOOR_SIZE / 2) position.current.x = -FLOOR_SIZE / 2;
    if (position.current.z > FLOOR_SIZE / 2) position.current.z = FLOOR_SIZE / 2;
    if (position.current.z < -FLOOR_SIZE / 2) position.current.z = -FLOOR_SIZE / 2;

    // Report back to parent
    onUpdatePosition(
      { x: position.current.x, y: position.current.y, z: position.current.z },
      rotation.current,
      isWalking,
      !isGrounded.current
    );
  });

  return (
    <>
      <CameraController targetPosition={localPlayer.position} />
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {/* Floor */}
      <Grid infiniteGrid sectionColor="#6f6f6f" cellColor="#4f4f4f" position={[0, -0.01, 0]} args={[100, 100]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Objects / Obstacles */}
      <mesh position={[10, 2, 10]} castShadow receiveShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#ff5555" />
      </mesh>
      <mesh position={[-15, 1, -5]} castShadow receiveShadow>
         <cylinderGeometry args={[2, 2, 2, 32]} />
         <meshStandardMaterial color="#5555ff" />
      </mesh>
      {/* Stairs */}
      <group position={[-10, 0, 10]}>
        {[0, 1, 2, 3].map(i => (
            <mesh key={i} position={[0, i * 0.5 + 0.25, i * 1.5]} castShadow>
                <boxGeometry args={[4, 0.5, 1.5]} />
                <meshStandardMaterial color="#55ff55" />
            </mesh>
        ))}
      </group>


      {/* Local Player */}
      <Avatar 
        colors={localPlayer.colors} 
        position={[localPlayer.position.x, localPlayer.position.y, localPlayer.position.z]}
        rotation={localPlayer.rotation}
        isWalking={localPlayer.action === 'walking'}
        isJumping={localPlayer.action === 'jumping'}
      />

      {/* Other Players (Mock Multiplayer) */}
      {otherPlayers.map(p => (
        <Avatar 
          key={p.id}
          colors={p.colors}
          position={[p.position.x, p.position.y, p.position.z]}
          rotation={p.rotation}
          isWalking={p.action === 'walking'}
          isJumping={p.action === 'jumping'}
        />
      ))}
      
      {/* Name Tags (Simple Text Billboard for players) */}
      {[localPlayer, ...otherPlayers].map(p => (
          <group key={`name-${p.id}`} position={[p.position.x, p.position.y + 4.5, p.position.z]}>
              <mesh>
                  <planeGeometry args={[0,0]}/> 
                  {/* Using Drei Text is better */}
              </mesh>
              {/* @ts-ignore */}
              <group rotation={[0, Math.PI, 0]}>
                 {/* Hack: Simple billboard logic in R3F usually requires lookAt camera. 
                     For MVP, we just rotate it generally or use Sprite. 
                     Here we omit complex billboards for performance/simplicity in generated code.
                 */}
              </group>
          </group>
      ))}
    </>
  );
};

const Game3D: React.FC<Game3DProps> = (props) => {
  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Scene {...props} />
      </Canvas>
    </div>
  );
};

export default Game3D;
