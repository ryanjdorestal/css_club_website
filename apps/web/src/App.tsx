import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HoundChat } from "@/mascot/HoundChat";
import { LenisProvider } from "@/motion/LenisProvider";
import { ProgressBar } from "@/motion/ProgressBar";
import { StatusBar } from "@/components/StatusBar";
import { ApiStateContext, type ApiState } from "@/lib/readouts";
import { useEffect, useState } from "react";

const Home = lazy(() => import("@/pages/Home"));
const Events = lazy(() => import("@/pages/Events"));
const Apps = lazy(() => import("@/pages/Apps"));
const Cyberhounds = lazy(() => import("@/pages/Cyberhounds"));
const About = lazy(() => import("@/pages/About"));
const Resources = lazy(() => import("@/pages/Resources"));
const Join = lazy(() => import("@/pages/Join"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));
const OsLayout = lazy(() => import("@/os/OsLayout"));
const OsLogin = lazy(() => import("@/os/OsLogin"));
const OsToday = lazy(() => import("@/os/OsToday"));
const OsQueue = lazy(() => import("@/os/OsQueue"));
const News = lazy(() => import("@/pages/News").then((m) => ({ default: m.NewsIndex })));
const NewsArticle = lazy(() => import("@/pages/News").then((m) => ({ default: m.NewsArticle })));

/** Route → section accent (one accent per section — DESIGN.md). */
const ACCENT_BY_PATH: Record<string, "red" | "green" | "blue" | "teal"> = {
  "/events": "red",
  "/cyberhounds": "red",
  "/apps": "green",
  "/about": "blue",
  "/resources": "teal",
  "/news": "blue",
  "/join": "blue",
};

function Layout() {
  const { pathname } = useLocation();
  const accent =
    Object.entries(ACCENT_BY_PATH).find(([p]) => pathname.startsWith(p))?.[1] ?? "teal";
  const [api, setApi] = useState<ApiState>({ live: null, ms: null });
  useEffect(() => {
    const t0 = performance.now();
    fetch("/api/health", { signal: AbortSignal.timeout(3000) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setApi({ live: true, ms: Math.round(performance.now() - t0) }))
      .catch(() => setApi({ live: false, ms: null }));
  }, []);
  return (
    <ApiStateContext.Provider value={api}>
    <div data-accent={accent} className="min-h-dvh flex flex-col bg-navy-600">
      <ProgressBar />
      <Nav />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.35 }}
          className="grow flex flex-col"
        >
          <Outlet />
          <Footer />
        </motion.div>
      </AnimatePresence>
      <HoundChat />
      <StatusBar />
    </div>
    </ApiStateContext.Provider>
  );
}

export default function App() {
  return (
    <LenisProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="os/login" element={<OsLogin />} />
          <Route path="os" element={<OsLayout />}>
            <Route index element={<OsToday />} />
            <Route path="queue" element={<OsQueue />} />
          </Route>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="apps" element={<Apps />} />
            <Route path="cyberhounds" element={<Cyberhounds />} />
            <Route path="about" element={<About />} />
            <Route path="resources" element={<Resources />} />
            <Route path="news" element={<News />} />
            <Route path="news/:slug" element={<NewsArticle />} />
            <Route path="join" element={<Join />} />
            <Route path="styleguide" element={<Styleguide />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </LenisProvider>
  );
}
