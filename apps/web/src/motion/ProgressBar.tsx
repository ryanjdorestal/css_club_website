import { motion, useScroll, useSpring } from "motion/react";

/** 2px accent page-scroll progress bar pinned under the nav. */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-(--accent)"
      style={{ scaleX }}
    />
  );
}
