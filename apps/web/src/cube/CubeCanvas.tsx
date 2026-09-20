import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useNavigate, Link } from "react-router-dom";

/** The cube itself — material/light recipe from context/06 (viewer.html parity).
    Faces are separate named meshes (red_C / green_S / blue_S / core), so
    cube-as-nav is a raycast against a name. */

const FACE_ROUTES: Record<string, { to: string; label: string }> = {
  red_C: { to: "/events", label: "C · Events" },
  green_S: { to: "/apps", label: "S · Apps" },
  blue_S: { to: "/join", label: "S · Join" },
};

function Env() {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.3;
  }, [gl, scene]);
  return null;
}

function CubeModel({
  paused,
  onFace,
}: {
  paused: boolean;
  onFace: (name: string | null) => void;
}) {
  const { scene } = useGLTF("/cube/cs_cube.glb");
  const group = useRef<THREE.Group>(null);
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const target = useRef({ x: 0, y: 0 });

  useMemo(() => {
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const base = (o.material as THREE.MeshStandardMaterial)?.color?.clone();
        if (o.name === "core") {
          o.material = new THREE.MeshStandardMaterial({ color: "#111114", roughness: 1 });
        } else {
          o.material = new THREE.MeshPhysicalMaterial({
            color: base,
            roughness: 0.42,
            metalness: 0,
            clearcoat: 0.55,
            clearcoatRoughness: 0.22,
          });
        }
      }
    });
  }, [scene]);

  useFrame(({ clock, pointer }) => {
    if (!group.current || paused) return;
    const t = clock.getElapsedTime();
    target.current.x = pointer.y * 0.18;
    target.current.y = t * 0.25 + pointer.x * 0.35;
    group.current.rotation.x += (target.current.x - group.current.rotation.x) * 0.06;
    group.current.rotation.y += (target.current.y - group.current.rotation.y) * 0.06;
    const s = hover ? 1.04 : 1;
    group.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  return (
    <group
      ref={group}
      onPointerMove={(e) => {
        e.stopPropagation();
        const name = e.object.name;
        const face = FACE_ROUTES[name] ? name : null;
        setHover(face);
        onFace(face);
        document.body.style.cursor = face ? "pointer" : "";
      }}
      onPointerOut={() => {
        setHover(null);
        onFace(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        const face = FACE_ROUTES[e.object.name];
        if (face) navigate(face.to);
      }}
    >
      <primitive object={scene} />
    </group>
  );
}

export default function CubeCanvas({ paused }: { paused: boolean }) {
  const [face, setFace] = useState<string | null>(null);
  return (
    <div className="relative flex flex-col items-center gap-4">
      <div className="w-[min(76vw,420px)] aspect-[8/7]">
        <Canvas
          dpr={[1, 1.5]}
          frameloop={paused ? "never" : "always"}
          camera={{ position: [2.1, 1.8, 2.1], fov: 32 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.8 }}
        >
          <Env />
          <directionalLight position={[-1.5, 4.5, 3.5]} intensity={1.0} />
          <directionalLight position={[4, 1.5, -2]} intensity={0.45} />
          <ambientLight intensity={0.15} />
          <CubeModel paused={paused} onFace={setFace} />
          <EffectComposer>
            <Bloom intensity={0.35} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>
      <div className="h-6">
        {face ? (
          <span className="mono-label text-teal animate-pulse">→ {FACE_ROUTES[face].label}</span>
        ) : (
          <div className="flex gap-5">
            <Link to="/events" className="mono-label text-muted hover:text-ink transition-colors">
              <span style={{ color: "var(--color-cube-red)" }}>■</span> C · Events
            </Link>
            <Link to="/apps" className="mono-label text-muted hover:text-ink transition-colors">
              <span style={{ color: "var(--color-cube-green)" }}>■</span> S · Apps
            </Link>
            <Link to="/join" className="mono-label text-muted hover:text-ink transition-colors">
              <span style={{ color: "var(--color-cube-blue)" }}>■</span> S · Join
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

useGLTF.preload("/cube/cs_cube.glb");
