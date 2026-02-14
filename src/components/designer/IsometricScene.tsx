"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox, useGLTF, useFBX } from "@react-three/drei";
import * as THREE from "three";
import { useDesignerStore } from "@/lib/designer-store";

const CM = 0.01; // 100cm = 1 unit

// ----- PRODUCT SHAPES -----

function ChairShape() {
  return (
    <group>
      <RoundedBox args={[0.4, 0.05, 0.4]} position={[0, 0.35, 0]} radius={0.015}>
        <meshStandardMaterial color="#e8cca8" />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.3, 0.05]} position={[0, 0.52, -0.17]} radius={0.015}>
        <meshStandardMaterial color="#d4b88c" />
      </RoundedBox>
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.17, p[1]]}>
          <cylinderGeometry args={[0.02, 0.02, 0.34, 8]} />
          <meshStandardMaterial color="#a08060" />
        </mesh>
      ))}
    </group>
  );
}

function TableShape() {
  return (
    <group>
      <RoundedBox args={[0.6, 0.04, 0.6]} position={[0, 0.48, 0]} radius={0.01}>
        <meshStandardMaterial color="#c8a878" />
      </RoundedBox>
      {[[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.24, p[1]]}>
          <cylinderGeometry args={[0.025, 0.025, 0.48, 8]} />
          <meshStandardMaterial color="#987858" />
        </mesh>
      ))}
    </group>
  );
}

function PlantShape() {
  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 12]} />
        <meshStandardMaterial color="#b86838" />
      </mesh>
      <mesh position={[0, 0.45, 0]} scale={[1, 1.1, 1]}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color="#5a8838" />
      </mesh>
    </group>
  );
}

function LightShape() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.08, 10]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#383838" />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.04, 0.14, 0.14, 10]} />
        <meshStandardMaterial color="#f0d060" emissive="#e8c040" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function CushionShape() {
  return (
    <RoundedBox args={[0.45, 0.12, 0.45]} position={[0, 0.06, 0]} radius={0.04} smoothness={4}>
      <meshStandardMaterial color="#d48850" />
    </RoundedBox>
  );
}

function RugShape() {
  return (
    <group>
      <RoundedBox args={[1.1, 0.018, 0.75]} position={[0, 0.01, 0]} radius={0.008}>
        <meshStandardMaterial color="#c0a068" />
      </RoundedBox>
      <RoundedBox args={[0.96, 0.02, 0.61]} position={[0, 0.011, 0]} radius={0.008}>
        <meshStandardMaterial color="#907850" />
      </RoundedBox>
    </group>
  );
}

function PlanterShape() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.24, 10]} />
        <meshStandardMaterial color="#c07040" />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.13, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a7228" />
      </mesh>
    </group>
  );
}

function BoxShape() {
  return (
    <RoundedBox args={[0.32, 0.32, 0.32]} position={[0, 0.16, 0]} radius={0.025}>
      <meshStandardMaterial color="#a09080" />
    </RoundedBox>
  );
}

// FBX Model Loader
function FBXModel({ url }: { url: string }) {
  const fbx = useFBX(url);
  
  const processedModel = useMemo(() => {
    if (!fbx) return null;
    
    const clone = fbx.clone();
    
    // Calculate bounding box to normalize scale
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Target size: most furniture should be around 0.4-0.6 units (40-60cm)
    const targetSize = 0.5;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;
    
    // Center the model
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    clone.scale.set(scale, scale, scale);
    
    // Traverse and ensure all materials are set up correctly
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Ensure materials are visible
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.side = THREE.DoubleSide;
            });
          } else {
            mesh.material.side = THREE.DoubleSide;
          }
        }
      }
    });
    
    return clone;
  }, [fbx]);
  
  if (!processedModel) return <BoxShape />;
  
  return <primitive object={processedModel} />;
}

// GLTF/GLB Model Loader
function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  
  const processedModel = useMemo(() => {
    if (!scene) return null;
    
    const clone = scene.clone();
    
    // Calculate bounding box to normalize scale
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Target size: most furniture should be around 0.4-0.6 units (40-60cm)
    const targetSize = 0.5;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;
    
    // Center the model
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    clone.scale.set(scale, scale, scale);
    
    // Traverse and ensure all materials are set up correctly
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);
  
  if (!processedModel) return <BoxShape />;
  
  return <primitive object={processedModel} />;
}

// 3D Model Loader Component - supports GLB, GLTF, FBX
function Model3D({ url }: { url: string }) {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (extension === 'fbx') {
    return <FBXModel url={url} />;
  } else {
    return <GLTFModel url={url} />;
  }
}

// Error boundary wrapper for 3D models
function SafeModel3D({ url }: { url: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (hasError) {
    return <BoxShape />;
  }

  return (
    <ErrorBoundary
      fallback={<BoxShape />}
      onError={(error) => {
        console.error("3D Model Error Boundary caught:", url, error);
        setHasError(true);
      }}
    >
      <Model3D url={url} />
    </ErrorBoundary>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ProductShape({ categorySlug, productName, modelUrl }: { categorySlug: string; productName: string; modelUrl?: string | null }) {
  // If a 3D model is available, use it
  if (modelUrl) {
    return <SafeModel3D url={modelUrl} />;
  }
  
  // Otherwise, fall back to procedural shapes
  const n = productName.toLowerCase();
  if (n.includes("cushion") || n.includes("pouf")) return <CushionShape />;
  if (n.includes("rug") || n.includes("carpet")) return <RugShape />;

  switch (categorySlug) {
    case "seating": return <ChairShape />;
    case "tables": return <TableShape />;
    case "plants": return <PlantShape />;
    case "lighting": return <LightShape />;
    case "planters": return <PlanterShape />;
    case "decor": return <RugShape />;
    default: return <BoxShape />;
  }
}

// ----- SMART WALLS BALCONY -----

function SmartWallsBalcony({ width, depth }: { width: number; depth: number }) {
  const wallH = 2.4;
  const railingH = 1.0;
  const { camera } = useThree();
  const { doorWall, setDoorWall } = useDesignerStore();
  const [wallsVisible, setWallsVisible] = useState({
    left: true,
    right: true,
    back: true,
    front: true,
  });

  // Update wall visibility based on camera angle
  useEffect(() => {
    const updateVisibility = () => {
      const cameraPos = camera.position;
      const centerPos = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3().subVectors(cameraPos, centerPos).normalize();

      // Calculate which walls to show based on camera position
      setWallsVisible({
        left: direction.x > 0.1,
        right: direction.x < -0.1,
        back: direction.z > 0.1,
        front: direction.z < -0.1,
      });
    };

    updateVisibility();
    const interval = setInterval(updateVisibility, 100);
    return () => clearInterval(interval);
  }, [camera]);

  // Railing component
  const Railing = ({ position, rotation, length }: { position: [number, number, number]; rotation: [number, number, number]; length: number }) => (
    <group position={position} rotation={rotation}>
      {/* Bottom rail */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[length, 0.05, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Top rail */}
      <mesh position={[0, railingH, 0]}>
        <boxGeometry args={[length, 0.06, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Vertical posts */}
      {Array.from({ length: Math.floor(length / 0.3) + 1 }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + (i * length) / Math.floor(length / 0.3), railingH / 2, 0]}>
          <boxGeometry args={[0.03, railingH - 0.15, 0.03]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );

  // Static glass door component (for planning) - clickable to move to different walls
  const GlassDoor = ({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) => {
    const doorWidth = 0.9;
    const doorHeight = 2.1;

    const cycleDoorWall = () => {
      const walls: Array<'left' | 'right' | 'back' | 'front'> = ['left', 'right', 'back', 'front'];
      const currentIndex = walls.indexOf(doorWall);
      const nextIndex = (currentIndex + 1) % walls.length;
      setDoorWall(walls[nextIndex]);
    };

    return (
      <group position={position} rotation={rotation}>
        {/* Door frame */}
        <mesh position={[0, doorHeight / 2, 0]}>
          <boxGeometry args={[doorWidth + 0.15, doorHeight + 0.2, 0.08]} />
          <meshStandardMaterial color="#b8a890" />
        </mesh>

        {/* Glass door panel */}
        <mesh position={[0, doorHeight / 2, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[doorWidth - 0.1, doorHeight - 0.1, 0.03]} />
          <meshPhysicalMaterial
            color="#f0f8ff"
            transparent
            opacity={0.3}
            roughness={0.05}
            metalness={0.05}
            transmission={0.85}
          />
        </mesh>

        {/* Door frame edges - lighter */}
        <mesh position={[-doorWidth / 2 + 0.05, doorHeight / 2, 0.02]}>
          <boxGeometry args={[0.04, doorHeight - 0.05, 0.04]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[doorWidth / 2 - 0.05, doorHeight / 2, 0.02]}>
          <boxGeometry args={[0.04, doorHeight - 0.05, 0.04]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.02]}>
          <boxGeometry args={[doorWidth - 0.1, 0.04, 0.04]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, doorHeight - 0.05, 0.02]}>
          <boxGeometry args={[doorWidth - 0.1, 0.04, 0.04]} />
          <meshStandardMaterial color="#6a5a4a" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Door handle - lighter */}
        <mesh position={[doorWidth / 2 - 0.15, doorHeight / 2, 0.06]}>
          <boxGeometry args={[0.03, 0.12, 0.03]} />
          <meshStandardMaterial color="#d4d4d4" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Click area to move door to different wall */}
        <mesh
          position={[0, doorHeight / 2, 0.05]}
          onClick={(e) => {
            e.stopPropagation();
            cycleDoorWall();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[doorWidth + 0.15, doorHeight + 0.2, 0.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Visual indicator that door is clickable */}
        <mesh position={[0, doorHeight + 0.15, 0.05]}>
          <boxGeometry args={[0.15, 0.05, 0.02]} />
            <meshBasicMaterial color="#A7B500" />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Floor base - thinner, lighter */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[width + 0.2, 0.1, depth + 0.2]} />
        <meshStandardMaterial color="#8a7a6a" />
      </mesh>
      
      {/* Floor surface - brighter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#e8d4b8" />
      </mesh>

      {/* Floor edge trim - lighter */}
      <mesh position={[-width / 2, 0.02, 0]}>
        <boxGeometry args={[0.02, 0.04, depth]} />
        <meshStandardMaterial color="#b89870" />
      </mesh>
      <mesh position={[width / 2, 0.02, 0]}>
        <boxGeometry args={[0.02, 0.04, depth]} />
        <meshStandardMaterial color="#b89870" />
      </mesh>
      <mesh position={[0, 0.02, -depth / 2]}>
        <boxGeometry args={[width, 0.04, 0.02]} />
        <meshStandardMaterial color="#b89870" />
      </mesh>
      <mesh position={[0, 0.02, depth / 2]}>
        <boxGeometry args={[width, 0.04, 0.02]} />
        <meshStandardMaterial color="#b89870" />
      </mesh>

      {/* Left wall */}
      {doorWall === 'left' ? (
        <>
          {/* Wall sections with door */}
          {wallsVisible.left && (
            <>
              <mesh position={[-width / 2 - 0.06, wallH / 2, -depth / 4 - 0.45]} castShadow receiveShadow>
                <boxGeometry args={[0.12, wallH, depth / 2 - 0.9]} />
                <meshStandardMaterial color="#e8b89a" transparent opacity={0.95} />
              </mesh>
              <mesh position={[-width / 2 - 0.06, wallH / 2, depth / 4 + 0.45]} castShadow receiveShadow>
                <boxGeometry args={[0.12, wallH, depth / 2 - 0.9]} />
                <meshStandardMaterial color="#e8b89a" transparent opacity={0.95} />
              </mesh>
            </>
          )}
          {/* Door is always visible when on this wall */}
          <GlassDoor position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        </>
      ) : wallsVisible.left ? (
        <mesh position={[-width / 2 - 0.06, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, wallH, depth + 0.2]} />
          <meshStandardMaterial color="#e8b89a" transparent opacity={0.95} />
        </mesh>
      ) : null}

      {/* Right wall */}
      {doorWall === 'right' ? (
        <>
          {/* Wall sections with door */}
          {wallsVisible.right && (
            <>
              <mesh position={[width / 2 + 0.06, wallH / 2, -depth / 4 - 0.45]} castShadow receiveShadow>
                <boxGeometry args={[0.12, wallH, depth / 2 - 0.9]} />
                <meshStandardMaterial color="#e8b89a" transparent opacity={0.95} />
              </mesh>
              <mesh position={[width / 2 + 0.06, wallH / 2, depth / 4 + 0.45]} castShadow receiveShadow>
                <boxGeometry args={[0.12, wallH, depth / 2 - 0.9]} />
                <meshStandardMaterial color="#e8b89a" transparent opacity={0.95} />
              </mesh>
            </>
          )}
          {/* Door is always visible when on this wall */}
          <GlassDoor position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        </>
      ) : wallsVisible.right ? (
        <mesh position={[width / 2 + 0.06, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, wallH, depth + 0.2]} />
          <meshStandardMaterial color="#e8b89a" transparent opacity={0.95} />
        </mesh>
      ) : null}

      {/* Back wall */}
      {doorWall === 'back' ? (
        <>
          {/* Wall sections with door */}
          {wallsVisible.back && (
            <>
              <mesh position={[-width / 4 - 0.45, wallH / 2, -depth / 2 - 0.06]} castShadow receiveShadow>
                <boxGeometry args={[width / 2 - 0.9, wallH, 0.12]} />
                <meshStandardMaterial color="#c8a878" transparent opacity={0.95} />
              </mesh>
              <mesh position={[width / 4 + 0.45, wallH / 2, -depth / 2 - 0.06]} castShadow receiveShadow>
                <boxGeometry args={[width / 2 - 0.9, wallH, 0.12]} />
                <meshStandardMaterial color="#c8a878" transparent opacity={0.95} />
              </mesh>
            </>
          )}
          {/* Door is always visible when on this wall */}
          <GlassDoor position={[0, 0, -depth / 2]} rotation={[0, 0, 0]} />
        </>
      ) : wallsVisible.back ? (
        <mesh position={[0, wallH / 2, -depth / 2 - 0.06]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.2, wallH, 0.12]} />
          <meshStandardMaterial color="#c8a878" transparent opacity={0.95} />
        </mesh>
      ) : null}

      {/* Front - railing or door */}
      {doorWall === 'front' ? (
        <>
          {/* Railing sections with door gap */}
          {wallsVisible.front && (
            <>
              <Railing position={[-width / 4 - 0.45, 0, depth / 2]} rotation={[0, 0, 0]} length={width / 2 - 0.9} />
              <Railing position={[width / 4 + 0.45, 0, depth / 2]} rotation={[0, 0, 0]} length={width / 2 - 0.9} />
            </>
          )}
          {/* Door is always visible when on this wall */}
          <GlassDoor position={[0, 0, depth / 2]} rotation={[0, Math.PI, 0]} />
        </>
      ) : wallsVisible.front ? (
        <Railing position={[0, 0, depth / 2]} rotation={[0, 0, 0]} length={width} />
      ) : null}

      {/* Left railing (in front of wall) */}
      <Railing position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={depth} />

      {/* Right railing (in front of wall) */}
      <Railing position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={depth} />

      {/* Corner posts */}
      <mesh position={[-width / 2, railingH / 2, -depth / 2]}>
        <boxGeometry args={[0.06, railingH + 0.1, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2, railingH / 2, -depth / 2]}>
        <boxGeometry args={[0.06, railingH + 0.1, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-width / 2, railingH / 2, depth / 2]}>
        <boxGeometry args={[0.06, railingH + 0.1, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2, railingH / 2, depth / 2]}>
        <boxGeometry args={[0.06, railingH + 0.1, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ----- DRAGGABLE PRODUCT -----

function DraggableProduct({
  item,
  product,
  roomW,
  roomD,
  isSelected,
  onSelect,
}: {
  item: any;
  product: any;
  roomW: number;
  roomD: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, controls, raycaster, scene } = useThree();
  const { updateItem, pushHistory } = useDesignerStore();
  const [isDragging, setIsDragging] = useState(false);
  const intersectionPoint = useRef<THREE.Vector3>(new THREE.Vector3());
  const offsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const initialPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Check if item can be wall-mounted
  const canWallMount = () => {
    const slug = product.category?.slug;
    const name = product.name.toLowerCase();
    return slug === "lighting" || name.includes("light") || name.includes("lamp");
  };

  const isWallMountable = canWallMount();

  // Normalize scale based on category - all items roughly same visual size
  const getScale = () => {
    const slug = product.category?.slug;
    const name = product.name.toLowerCase();
    
    // Base scale for consistent sizing
    if (name.includes("rug") || name.includes("carpet")) return 1.0;
    if (name.includes("bench")) return 1.2;
    if (slug === "tables") return 1.0;
    if (slug === "seating") return 0.9;
    if (slug === "plants" || slug === "planters") return 0.85;
    if (slug === "lighting") return 0.75;
    return 0.8;
  };

  const scale = getScale();
  
  // Get stored height or default to 0 (floor)
  const storedHeight = (item as any).height || 0;
  const posX = (item.x / 2) * CM - roomW / 2;
  const posZ = (item.y / 2) * CM - roomD / 2;
  const posY = storedHeight * CM;

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!groupRef.current) return;
    
    // Select the item first
    if (!isSelected) {
      onSelect();
    }
    
    setIsDragging(true);
    if (controls) (controls as any).enabled = false;
    
    initialPosRef.current.copy(groupRef.current.position);
    
    // Store initial offset
    const pointer = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    
    // For wall-mountable items, use a vertical plane; for others, use floor plane
    if (isWallMountable) {
      // Create a plane perpendicular to camera view for free 3D movement
      const planeNormal = new THREE.Vector3();
      camera.getWorldDirection(planeNormal);
      planeNormal.y = 0; // Keep it vertical
      planeNormal.normalize();
      const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        planeNormal,
        groupRef.current.position
      );
      raycaster.ray.intersectPlane(dragPlane, intersectionPoint.current);
    } else {
      // Floor plane for non-wall-mountable items
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      raycaster.ray.intersectPlane(floorPlane, intersectionPoint.current);
    }
    
    offsetRef.current.copy(intersectionPoint.current).sub(groupRef.current.position);
  };

  const handlePointerMove = (e: MouseEvent) => {
    if (!isDragging || !groupRef.current) return;
    
    const pointer = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    
    if (isWallMountable) {
      // For wall-mountable items, allow 3D movement
      const planeNormal = new THREE.Vector3();
      camera.getWorldDirection(planeNormal);
      planeNormal.y = 0;
      planeNormal.normalize();
      const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        planeNormal,
        initialPosRef.current
      );
      
      if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint.current)) {
        const newPos = intersectionPoint.current.sub(offsetRef.current);
        
        // Constrain to balcony bounds
        const halfW = roomW / 2 - 0.3;
        const halfD = roomD / 2 - 0.3;
        newPos.x = Math.max(-halfW, Math.min(halfW, newPos.x));
        newPos.z = Math.max(-halfD, Math.min(halfD, newPos.z));
        newPos.y = Math.max(0, Math.min(2.0, newPos.y)); // Allow height 0 to 2m
        
        groupRef.current.position.copy(newPos);
      }
    } else {
      // For floor items, lock to floor
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      if (raycaster.ray.intersectPlane(floorPlane, intersectionPoint.current)) {
        const newPos = intersectionPoint.current.sub(offsetRef.current);
        
        // Constrain to balcony bounds
        const halfW = roomW / 2 - 0.3;
        const halfD = roomD / 2 - 0.3;
        newPos.x = Math.max(-halfW, Math.min(halfW, newPos.x));
        newPos.z = Math.max(-halfD, Math.min(halfD, newPos.z));
        newPos.y = 0; // Lock to floor
        
        groupRef.current.position.copy(newPos);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || !groupRef.current) return;
    
    setIsDragging(false);
    
    // Re-enable controls immediately
    if (controls) {
      (controls as any).enabled = true;
    }
    
    // Convert back to canvas coordinates and save
    const newX = ((groupRef.current.position.x + roomW / 2) / CM) * 2;
    const newY = ((groupRef.current.position.z + roomD / 2) / CM) * 2;
    const newHeight = groupRef.current.position.y / CM;
    
    // Push to history before updating
    pushHistory();
    
    updateItem(item.id, { 
      x: newX, 
      y: newY,
      ...(isWallMountable && { height: newHeight })
    });
  };
  
  // Add/remove global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, isWallMountable, roomW, roomD]);
  
  // Re-enable controls if component unmounts while dragging
  useEffect(() => {
    return () => {
      if (controls && isDragging) {
        (controls as any).enabled = true;
      }
    };
  }, [controls, isDragging]);

  return (
    <group
      ref={groupRef}
      position={[posX, posY, posZ]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      scale={[scale, scale, scale]}
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) onSelect();
      }}
    >
      <ProductShape categorySlug={product.category?.slug || "decor"} productName={product.name} modelUrl={product.modelUrl} />
      
      {/* Selection highlight - glowing outline */}
      {isSelected && (
        <>
          {/* Floor ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <ringGeometry args={[0.4, 0.48, 32]} />
            <meshBasicMaterial color="#8fa64a" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          
          {/* Pulsing glow effect */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
            <ringGeometry args={[0.35, 0.5, 32]} />
            <meshBasicMaterial 
              color="#CADC82" 
              side={THREE.DoubleSide} 
              transparent 
              opacity={0.3}
            />
          </mesh>
          
          {/* Vertical highlight bars at corners */}
          {[-0.35, 0.35].map((x) =>
            [-0.35, 0.35].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.25, z]}>
                <boxGeometry args={[0.02, 0.5, 0.02]} />
                <meshBasicMaterial color="#8fa64a" transparent opacity={0.6} />
              </mesh>
            ))
          )}
        </>
      )}
    </group>
  );
}

// ----- SCENE -----

function Scene() {
  const { balconyWidthCm, balconyHeightCm, items, products, selectedItemId, setSelectedItemId } =
    useDesignerStore();

  const roomW = balconyWidthCm * CM;
  const roomD = balconyHeightCm * CM;
  const maxDim = Math.max(roomW, roomD);

  return (
    <>
      {/* Orbit controls - full control */}
      <OrbitControls
        makeDefault
        target={[0, 0.6, 0]}
        minDistance={maxDim * 1.5}
        maxDistance={maxDim * 8}
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        panSpeed={0.8}
        zoomSpeed={1}
      />

      {/* Lights - brighter, more natural */}
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight
        position={[6, 10, 8]}
        intensity={2.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-maxDim * 2.5}
        shadow-camera-right={maxDim * 2.5}
        shadow-camera-top={maxDim * 2.5}
        shadow-camera-bottom={-maxDim * 2.5}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-4, 6, -3]} intensity={1.0} color="#fffef8" />
      <pointLight position={[0, 2, 0]} intensity={0.6} color="#ffffff" distance={6} />
      <hemisphereLight args={["#ffffff", "#d8d8d8", 0.8]} />

      {/* Background - light greenish gradient */}
      <color attach="background" args={["#d8e4d8"]} />

      {/* Balcony */}
      <SmartWallsBalcony width={roomW} depth={roomD} />

      {/* Products */}
      {items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;

        const isSelected = selectedItemId === item.id;

        return (
          <DraggableProduct
            key={item.id}
            item={item}
            product={product}
            roomW={roomW}
            roomD={roomD}
            isSelected={isSelected}
            onSelect={() => setSelectedItemId(isSelected ? null : item.id)}
          />
        );
      })}
    </>
  );
}

export function IsometricScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ 
          position: [6, 5, 6],
          fov: 50,
        }}
        onPointerMissed={() => useDesignerStore.getState().setSelectedItemId(null)}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
