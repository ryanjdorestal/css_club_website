import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Edges } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";
import { easing } from "maath";
import { brand } from "@brand/brand.config";

/** Head pivot from assets/hound3d/build_hound.py (HEAD_PIVOT) — the head
    mesh is exported in world space and yaws around this point. */
const HEAD_PIVOT = new THREE.Vector3(0, 0.96, 0.1);
const GLB = "/hound/cyberhound.glb";
const d2r = THREE.MathUtils.degToRad;

/** Same lighting recipe as CubeSpot + a RoomEnvironment (page-local). */
function RoomEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.35;
    return () => {
      scene.environment = null;
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function pickMesh(scene: THREE.Object3D, name: string): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  scene.traverse((o) => {
    if (!found && o instanceof THREE.Mesh && o.name === name) found = o;
  });
  return found;
}

function Bust({ paused }: { paused: boolean }) {
  const { scene } = useGLTF(GLB);
  const geo = useMemo(() => {
    const g = (n: string) => pickMesh(scene, n)?.geometry ?? new THREE.BufferGeometry();
    return { body: g("body"), head: g("head"), eyes: g("eyes"), nose: g("nose") };
  }, [scene]);

  const red = brand.palette.red;
  const redHi = brand.palette.redHi;
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0B0B0D", roughness: 0.55, metalness: 0.15 }), []);
  const shellMat = useMemo(() => new THREE.MeshBasicMaterial({ color: red, side: THREE.BackSide, transparent: true, opacity: 0.9 }), [red]);
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a0508", emissive: redHi, emissiveIntensity: 1.4, roughness: 0.4 }), [redHi]);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a0406", emissive: redHi, emissiveIntensity: 0.35, roughness: 0.45 }), [redHi]);

  const root = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const drag = useRef({ on: false, x: 0, y: 0, rx: 0, ry: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  // pointer-follow across the whole window (relative to the viewport centre), clamped
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = THREE.MathUtils.clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    if (paused || !root.current || !head.current || !chest.current) return;
    const t = state.clock.elapsedTime;
    // idle: slow head turn ±8° over 6 s; pointer-follow: yaw ±18° (+ a little pitch), eased
    const idle = Math.sin((t * Math.PI * 2) / 6) * d2r(8);
    const yaw = idle + d2r(18) * pointer.current.x;
    const pitch = d2r(7) * pointer.current.y;
    easing.dampE(head.current.rotation, [pitch, yaw, 0], 0.28, dt);
    // breath: chest scale y 1.00 → 1.015 over 3 s
    chest.current.scale.y = 1 + 0.015 * (0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 3));
    // drag rotates the whole bust
    easing.dampE(root.current.rotation, [drag.current.rx, drag.current.ry, 0], 0.3, dt);
    // hover: the eye slits brighten
    easing.damp(eyeMat, "emissiveIntensity", hover ? 2.2 : 1.4, 0.2, dt);
  });

  return (
    <group
      ref={root}
      position={[0, -0.86, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        drag.current.on = true;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.on) return;
        drag.current.ry += (e.clientX - drag.current.x) * 0.006;
        drag.current.rx = THREE.MathUtils.clamp(drag.current.rx + (e.clientY - drag.current.y) * 0.004, -0.5, 0.5);
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
      }}
      onPointerUp={() => (drag.current.on = false)}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      <group ref={chest}>
        <mesh geometry={geo.body} material={bodyMat}>
          <Edges threshold={40} color={red} lineWidth={1.5} />
          <mesh geometry={geo.body} material={shellMat} scale={1.03} />
        </mesh>
      </group>
      <group ref={head} position={HEAD_PIVOT}>
        <group position={HEAD_PIVOT.clone().negate()}>
          <mesh geometry={geo.head} material={bodyMat}>
            <Edges threshold={40} color={red} lineWidth={1.5} />
            <mesh geometry={geo.head} material={shellMat} scale={1.03} />
          </mesh>
          <mesh geometry={geo.eyes} material={eyeMat} />
          <mesh geometry={geo.nose} material={noseMat} />
        </group>
      </group>
    </group>
  );
}

export default function CyberhoundCanvas({ size, paused }: { size: number; paused: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0.18, 3.95], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.9 }}
      style={{ width: size, height: size, touchAction: "none" }}
    >
      <RoomEnv />
      <hemisphereLight args={["#dfe8f2", "#1a2c44", 0.5]} />
      <directionalLight position={[-2, 4.5, 3.5]} intensity={1.4} />
      <directionalLight position={[4, 1.5, -2]} intensity={0.5} />
      <directionalLight position={[0, 1.5, -4]} intensity={0.9} color={brand.palette.redHi} />
      <ambientLight intensity={0.18} />
      <Bust paused={paused} />
      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.8} intensity={0.5} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload(GLB);
