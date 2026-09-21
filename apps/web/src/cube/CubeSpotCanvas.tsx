import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { easing } from "maath";
import { FACE_QUAT, FACE_ROUTE, applyCubeMaterials } from "./cubeCommon";

function SpotCube({ face, glow = "#6ED2E6", interactive, paused }: { face: keyof typeof FACE_QUAT; glow?: string; interactive: boolean; paused: boolean }) {
  const { scene } = useGLTF("/cube/cs_cube.glb");
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    applyCubeMaterials(c);
    return c;
  }, [scene]);
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ on: false, x: 0, y: 0, rx: 0, ry: 0 });
  const navigate = useNavigate();

  useFrame((state, dt) => {
    if (!group.current || paused) return;
    const t = state.clock.elapsedTime;
    const target = FACE_QUAT[face].clone();
    const drift = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(drag.current.rx + Math.sin(t * 0.5) * 0.05, drag.current.ry + Math.sin(t * 0.35) * 0.09, 0),
    );
    target.multiply(drift);
    easing.dampQ(group.current.quaternion, target, 0.3, dt);
    group.current.position.y = Math.sin(t * 1.1) * 0.045;
    // fill ~85% of the frustum regardless of canvas px (canvas CSS handles px size)
    easing.damp3(group.current.scale, [0.88, 0.88, 0.88], 0.25, dt);
  });

  return (
    <group
      ref={group}
      onPointerDown={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        drag.current.on = true;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.on) return;
        drag.current.ry += (e.clientX - drag.current.x) * 0.006;
        drag.current.rx += (e.clientY - drag.current.y) * 0.006;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
      }}
      onPointerUp={() => {
        const moved = Math.abs(drag.current.rx) + Math.abs(drag.current.ry);
        drag.current.on = false;
        if (interactive && moved < 0.02) {
          const route = FACE_ROUTE[face] ?? null;
          if (route) navigate(route);
        }
      }}
      onPointerOver={() => interactive && FACE_ROUTE[face] && (document.body.style.cursor = "grab")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <primitive object={cloned} />
      <mesh scale={1.028}>
        <boxGeometry args={[1.02, 1.02, 1.02]} />
        <meshBasicMaterial color={glow} side={THREE.BackSide} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function CubeSpotCanvas({
  size,
  face,
  glow,
  interactive,
  paused,
}: {
  size: number;
  face: keyof typeof FACE_QUAT;
  glow?: string;
  interactive: boolean;
  paused: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0, 3.4], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.85 }}
      style={{ width: size, height: size, touchAction: "none" }}
    >
      <hemisphereLight args={["#dfe8f2", "#1a2c44", 0.55]} />
      <directionalLight position={[-1.5, 4.5, 3.5]} intensity={1.35} />
      <directionalLight position={[4, 1.5, -2]} intensity={0.6} />
      <ambientLight intensity={0.22} />
      <SpotCube face={face} glow={glow} interactive={interactive} paused={paused} />
    </Canvas>
  );
}

useGLTF.preload("/cube/cs_cube.glb");
