
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CardBackShader } from '../shaders/CardShaders';
import { GestureState, TarotCardInfo } from '../types';
import { THEME } from '../constants';

interface TarotCardProps {
  index: number;
  total: number;
  info: TarotCardInfo;
  currentState: GestureState;
  handX: number;
  handY: number;
  isSelected: boolean;
}

const TarotCard: React.FC<TarotCardProps> = ({ 
  index, total, info, currentState, handX, handY, isSelected 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const backMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Custom easing function cubic-bezier(0.77, 0, 0.175, 1)
  const targetPos = useRef(new THREE.Vector3(0, 0, -index * 0.01));
  const targetRot = useRef(new THREE.Euler(0, Math.PI, 0));
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));

  // Front Texture
  const texture = useMemo(() => new THREE.TextureLoader().load(info.image), [info.image]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (backMaterialRef.current) {
      backMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    // Determine target based on state
    if (currentState === GestureState.IDLE) {
      targetPos.current.set(0, 0, -index * 0.01);
      targetRot.current.set(0, Math.PI, 0);
      targetScale.current.set(1, 1, 1);
    } 
    else if (currentState === GestureState.SHUFFLING) {
      const angle = (index / total) * Math.PI * 2;
      const radius = 3.5 + Math.sin(state.clock.elapsedTime + index) * 0.2;
      
      // Shift center based on hand position
      const centerX = (handX - 0.5) * 10;
      const centerY = (0.5 - handY) * 6;

      targetPos.current.set(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius,
        -index * 0.01 - 2
      );
      targetRot.current.set(0, Math.PI, angle);
      targetScale.current.set(0.8, 0.8, 1);
    }
    else if (currentState === GestureState.SELECTING || currentState === GestureState.REVEALING) {
      if (isSelected) {
        targetPos.current.set(0, 0, 2);
        
        // Float effect
        const floatY = Math.sin(state.clock.elapsedTime * 4) * 0.05;
        targetPos.current.y += floatY;

        if (currentState === GestureState.REVEALING) {
          targetRot.current.set(0, 0, 0); // Show front
        } else {
          targetRot.current.set(0, Math.PI, 0); // Show back
        }
        targetScale.current.set(1.5, 1.5, 1);
      } else {
        // Blur/Move others to background
        targetPos.current.set(
          (index % 10 - 5) * 1.5, 
          (Math.floor(index / 10) - 2) * 2, 
          -5
        );
        targetRot.current.set(0, Math.PI, 0);
        targetScale.current.set(0.5, 0.5, 1);
      }
    }

    // Smooth transition (lerp)
    const lerpFactor = 0.08;
    groupRef.current.position.lerp(targetPos.current, lerpFactor);
    groupRef.current.scale.lerp(targetScale.current, lerpFactor);
    
    // Rotation lerp needs a bit more care
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot.current.x, lerpFactor);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot.current.y, lerpFactor);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRot.current.z, lerpFactor);
  });

  return (
    <group ref={groupRef}>
      {/* Front Face */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Back Face */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.01]}>
        <planeGeometry args={[2, 3]} />
        <shaderMaterial
          ref={backMaterialRef}
          {...CardBackShader}
          transparent
        />
      </mesh>

      {/* Border/Edge Glow if selected */}
      {isSelected && (
         <mesh scale={[1.05, 1.05, 1]} position={[0,0,-0.02]}>
            <planeGeometry args={[2, 3]} />
            <meshBasicMaterial color={THEME.gold} transparent opacity={0.3} side={THREE.DoubleSide} />
         </mesh>
      )}
    </group>
  );
};

export default TarotCard;
