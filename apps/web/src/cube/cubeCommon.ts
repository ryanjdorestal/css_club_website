import * as THREE from "three";
import type { Face } from "./CubeRailContext";

/** Face map from context/06: +Z red C · +X blue S · +Y green S. */
export const FACE_QUAT: Record<Exclude<Face, null>, THREE.Quaternion> = {
  red: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -0.18, 0)),
  blue: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -Math.PI / 2 - 0.18, 0)),
  green: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.25, 0, 0.1)),
  threeQuarter: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, -0.68, 0)),
  edge: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -Math.PI / 4, 0)),
};

export const FACE_ROUTE: Partial<Record<Exclude<Face, null>, string>> = {
  red: "/events",
  green: "/projects",
  blue: "/join",
};

/** Run-1 material recipe (context/06), applied to the GLB scene. */
export function applyCubeMaterials(scene: THREE.Object3D) {
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
}
