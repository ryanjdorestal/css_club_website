import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { CubeSpot } from "./CubeSpot";

const CubeCanvas = lazy(() => import("./CubeCanvas"));

/** Home hero cube. Three.js is code-split behind this lazy import and only
    mounts when the slot is on screen and motion is allowed; the PNG fallback
    renders instantly either way (Tier 1: the hero never breaks). */
export function CubeHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const showCanvas = visible && !reduced && !failed;
  return (
    <div ref={ref} className="relative">
      {showCanvas ? (
        <ErrorBoundaryish onFail={() => setFailed(true)}>
          <Suspense fallback={<CubeSpot />}>
            <CubeCanvas paused={!visible} />
          </Suspense>
        </ErrorBoundaryish>
      ) : (
        <CubeSpot />
      )}
    </div>
  );
}

import { Component, type ReactNode } from "react";
class ErrorBoundaryish extends Component<{ children: ReactNode; onFail: () => void }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.err ? null : this.props.children;
  }
}
