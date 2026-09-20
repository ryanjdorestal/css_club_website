import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { easing } from "maath";
import { useNavigate } from "react-router-dom";
import { useCubeRegistry, type CubeKeyframe, type Face } from "./CubeRailContext";

const FACE_QUAT: Record<Exclude<Face, null>, THREE.Quaternion> = {
  // face map from context/06: +Z red C · +X blue S · +Y green S
  red: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -0.18, 0)),
  blue: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -Math.PI / 2 - 0.18, 0)),
  green: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.25, 0, 0.1)),
  threeQuarter: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, -0.68, 0)),
  edge: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -Math.PI / 4, 0)),
};

const FACE_ROUTE: Partial<Record<Exclude<Face, null>, string>> = {
  red: "/events",
  green: "/apps",
  blue: "/join",
};

const DEFAULT_KF: CubeKeyframe = { x: 0.68, y: 0.5, scale: 1, face: "threeQuarter", glow: "#6ED2E6", spin: true };

function Env() {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.32;
  }, [gl, scene]);
  return null;
}

function RailCube({ onFace }: { onFace: (f: Face) => void }) {
  const reg = useCubeRegistry();
  const { scene } = useGLTF("/cube/cs_cube.glb");
  const group = useRef<THREE.Group>(null);
  const rim = useRef<THREE.Mesh>(null);
  const rimMat = useRef<THREE.MeshBasicMaterial>(null);
  const navigate = useNavigate();
  const spinY = useRef(0);
  const active = useRef<CubeKeyframe>(DEFAULT_KF);
  const glowColor = useRef(new THREE.Color("#6ED2E6"));
  const { viewport } = useThree();

  useMemo(() => {
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const base = (o.material as THREE.MeshStandardMaterial)?.color?.clone();
        o.material =
          o.name === "core"
            ? new THREE.MeshStandardMaterial({ color: "#111114", roughness: 1 })
            : new THREE.MeshPhysicalMaterial({
                color: base,
                roughness: 0.42,
                metalness: 0,
                clearcoat: 0.55,
                clearcoatRoughness: 0.22,
              });
      }
    });
  }, [scene]);

  useFrame((state, dt) => {
    if (!group.current) return;
    // 1. find the registered section under the viewport center
    const vhMid = window.innerHeight * 0.5;
    let kf = DEFAULT_KF;
    if (reg) {
      for (const e of reg.entries.current) {
        const r = e.el.getBoundingClientRect();
        if (r.top <= vhMid && r.bottom >= vhMid) {
          kf = e.kf;
          break;
        }
      }
    }
    if (active.current !== kf) {
      active.current = kf;
      onFace(kf.face);
    }
    // 2. damp position/scale toward the keyframe (λ≈5 → ~150ms trail)
    const wx = (kf.x - 0.5) * viewport.width;
    const wy = (0.5 - kf.y) * viewport.height;
    easing.damp3(group.current.position, [wx, wy, 0], 0.22, dt);
    const s = kf.scale * Math.min(viewport.width, viewport.height) * 0.16;
    easing.damp3(group.current.scale, [s, s, s], 0.25, dt);
    // 3. facing: slerp toward the face quaternion; idle drift on top
    const t = state.clock.elapsedTime;
    if (kf.spin) {
      spinY.current += dt * 0.15;
    }
    const target = FACE_QUAT[kf.face ?? "threeQuarter"].clone();
    const drift = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.sin(t * 0.6) * 0.05, spinY.current + Math.sin(t * 0.4) * 0.1, 0),
    );
    target.multiply(drift);
    easing.dampQ(group.current.quaternion, target, 0.28, dt);
    // float
    group.current.position.y += Math.sin(t * 1.1) * viewport.height * 0.004;
    // 4. rim glow color
    if (rimMat.current && kf.glow) {
      easing.dampC(glowColor.current, kf.glow, 0.3, dt);
      rimMat.current.color.copy(glowColor.current);
    }
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        const route = active.current.face && FACE_ROUTE[active.current.face];
        if (route) navigate(route);
      }}
      onPointerOver={() => {
        if (active.current.face && FACE_ROUTE[active.current.face]) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <primitive object={scene} />
      {/* teal/accent rim: slightly larger back-side shell, additive */}
      <mesh ref={rim} scale={1.045}>
        <boxGeometry args={[1.02, 1.02, 1.02]} />
        <meshBasicMaterial
          ref={rimMat}
          color="#6ED2E6"
          side={THREE.BackSide}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function CubeRailCanvas() {
  const [face, setFace] = useState<Face>("threeQuarter");
  return (
    <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 30 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.85 }}
        eventSource={document.body}
        style={{ pointerEvents: "none" }}
      >
        <Env />
        <directionalLight position={[-1.5, 4.5, 3.5]} intensity={1.0} />
        <directionalLight position={[4, 1.5, -2]} intensity={0.45} />
        <ambientLight intensity={0.15} />
        <RailCube onFace={setFace} />
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      </Canvas>
      {face && FACE_LABEL[face] && (
        <span
          className="mono-label text-teal absolute transition-opacity duration-500"
          style={{ left: "50%", bottom: "6%", transform: "translateX(-50%)" }}
        >
          {FACE_LABEL[face]}
        </span>
      )}
    </div>
  );
}

const FACE_LABEL: Partial<Record<Exclude<Face, null>, string>> = {
  red: "→ EVENTS · RED C",
  green: "→ APPS · GREEN S",
  blue: "→ JOIN · BLUE S",
};

useGLTF.preload("/cube/cs_cube.glb");
