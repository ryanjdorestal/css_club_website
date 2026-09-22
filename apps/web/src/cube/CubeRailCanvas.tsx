import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { easing } from "maath";
import { useNavigate } from "react-router-dom";
import { useCubeRegistry, type CubeKeyframe, type Face } from "./CubeRailContext";

import { FACE_QUAT, FACE_ROUTE, applyCubeMaterials } from "./cubeCommon";

const DEFAULT_KF: CubeKeyframe = { x: 0.68, y: 0.5, scale: 1, face: "threeQuarter", glow: "#6ED2E6", spin: true };

function RailCube({ onFace }: { onFace: (f: Face, kf?: CubeKeyframe) => void }) {
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

  useMemo(() => applyCubeMaterials(scene), [scene]);

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
    // the shared footer isn't inside the provider — dock the cube on the stamp
    const foot = document.getElementById("site-footer");
    if (foot) {
      const r = foot.getBoundingClientRect();
      if (r.top <= vhMid) {
        const dock = document.getElementById("footer-cube-dock");
        if (dock) {
          const d = dock.getBoundingClientRect();
          kf = {
            x: (d.left + d.width / 2) / window.innerWidth,
            y: (d.top + d.height / 2) / window.innerHeight,
            scale: 0.5,
            face: "threeQuarter",
            glow: "#6ED2E6",
          };
        } else {
          kf = { x: 0.5, y: 0.62, scale: 0.8, face: "threeQuarter", glow: "#6ED2E6" };
        }
      }
    }
    if (active.current !== kf) {
      active.current = kf;
      onFace(kf.face, kf);
    }
    // 2. damp position/scale toward the keyframe (λ≈5 → ~150ms trail)
    const wx = (kf.x - 0.5) * viewport.width;
    const wy = (0.5 - kf.y) * viewport.height;
    easing.damp3(group.current.position, [wx, wy, 0], 0.22, dt);
    const s = kf.scale * Math.min(viewport.width, viewport.height) * 0.34; // run 4: cube ≈420px at scale 1 on 1440×900
    easing.damp3(group.current.scale, [s, s, s], 0.25, dt);
    // 3. facing: slerp toward the face quaternion; idle drift on top
    const t = state.clock.elapsedTime;
    if (kf.spin) {
      spinY.current += dt * 0.15;
    }
    const target = FACE_QUAT[kf.face ?? "threeQuarter"].clone();
    const drift = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(t * 0.6) * 0.05, spinY.current + Math.sin(t * 0.4) * 0.1, 0));
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
      <mesh ref={rim} scale={1.028}>
        <boxGeometry args={[1.02, 1.02, 1.02]} />
        <meshBasicMaterial ref={rimMat} color="#6ED2E6" side={THREE.BackSide} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function CubeRailCanvas() {
  const [face, setFace] = useState<Face>("threeQuarter");
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0.68, y: 0.47 });
  return (
    <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 30 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.85 }}
        eventSource={document.body}
        style={{ pointerEvents: "none" }}
      >
        {/* PMREM RoomEnvironment dropped for TBT (run-2 log): lights approximate it */}
        <hemisphereLight args={["#dfe8f2", "#1a2c44", 0.55]} />
        <directionalLight position={[-1.5, 4.5, 3.5]} intensity={1.35} />
        <directionalLight position={[4, 1.5, -2]} intensity={0.6} />
        <ambientLight intensity={0.22} />
        <RailCube
          onFace={(f, kf) => {
            setFace(f);
            if (kf) setPos({ x: kf.x, y: kf.y });
          }}
        />
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      </Canvas>
      {face && FACE_LABEL[face] && (
        <span
          // The caption rides a fixed overlay over flowing copy, so it needs its own plate —
          // as bare text it read as two sentences printed on top of each other.
          className="mono-label text-teal absolute transition-all duration-700 pointer-events-none whitespace-nowrap border border-teal/35 bg-navy-900/85 px-2.5 py-1"
          style={{ left: `${pos.x * 100}%`, top: `calc(${pos.y * 100}% + 13vh)`, transform: "translateX(-50%)" }}
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
