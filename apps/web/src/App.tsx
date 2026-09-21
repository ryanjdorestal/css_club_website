import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HoundChat } from "@/mascot/HoundChat";
import { useApi } from "@/lib/useApi";
import siteSettingsData from "@data/site_settings.json";
import { LenisProvider } from "@/motion/LenisProvider";
import { ProgressBar } from "@/motion/ProgressBar";
import { StatusBar } from "@/components/StatusBar";
import { ApiStateContext, type ApiState } from "@/lib/readouts";
import { useEffect, useState } from "react";

const Home = lazy(() => import("@/pages/Home"));
const Events = lazy(() => import("@/pages/Events"));
const Projects = lazy(() => import("@/pages/Projects"));
const Cyberhounds = lazy(() => import("@/pages/Cyberhounds"));
const About = lazy(() => import("@/pages/About"));
const Resources = lazy(() => import("@/pages/Resources"));
const Join = lazy(() => import("@/pages/Join"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));
const OsLayout = lazy(() => import("@/os/OsLayout"));
const OsLogin = lazy(() => import("@/os/OsLogin"));
const OsToday = lazy(() => import("@/os/OsToday"));
const OsProjects = lazy(() => import("@/os/OsProjects"));
const OsPosts = lazy(() => import("@/os/OsPosts"));
const OsEvents = lazy(() => import("@/os/OsEvents"));
const OsWorkshops = lazy(() => import("@/os/OsWorkshops"));
const OsResources = lazy(() => import("@/os/OsResources"));
const OsMembers = lazy(() => import("@/os/OsMembers"));
const OsBoard = lazy(() => import("@/os/OsBoard"));
const OsSite = lazy(() => import("@/os/OsSite"));
const OsInheritance = lazy(() => import("@/os/OsInheritance"));
const OsSystem = lazy(() => import("@/os/OsSystem"));
const OsAudit = lazy(() => import("@/os/OsAudit"));
const News = lazy(() => import("@/pages/News").then((m) => ({ default: m.NewsIndex })));
const NewsArticle = lazy(() => import("@/pages/News").then((m) => ({ default: m.NewsArticle })));

/** Route → section accent (one accent per section — DESIGN.md). */
const ACCENT_BY_PATH: Record<string, "red" | "green" | "blue" | "teal"> = {
  "/events": "red",
  "/cyberhounds": "red",
  "/projects": "green",
  "/about": "blue",
  "/resources": "teal",
  "/news": "blue",
  "/join": "blue",
};

function Layout() {
  const { pathname } = useLocation();
  const accent = Object.entries(ACCENT_BY_PATH).find(([p]) => pathname.startsWith(p))?.[1] ?? "teal";
  const [api, setApi] = useState<ApiState>({ live: null, ms: null });
  useEffect(() => {
    const t0 = performance.now();
    fetch("/api/health", { signal: AbortSignal.timeout(3000) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setApi({ live: true, ms: Math.round(performance.now() - t0) }))
      .catch(() => setApi({ live: false, ms: null }));
  }, []);
  // the board's switches (run 10 §7 Site): the maintenance banner and the feature flags are honoured here, not just stored
  const { data: settings } = useApi<{ settings: Record<string, unknown> }>("/api/site-settings", {
    settings: siteSettingsData as unknown as Record<string, unknown>,
  });
  const banner = settings.settings.maintenance_banner as { on?: boolean; text?: string } | undefined;
  const flags = settings.settings.feature_flags as { chat_enabled?: boolean } | undefined;
  return (
    <ApiStateContext.Provider value={api}>
      <div data-accent={accent} className="min-h-dvh flex flex-col bg-navy-600">
        <ProgressBar />
        <Nav />
        {banner?.on && (
          <p
            role="status"
            data-testid="maintenance-banner"
            className="fixed top-[72px] inset-x-0 z-40 t-label raise text-center px-4 py-2 bg-(--color-red) text-ink"
          >
            ▲ {banner.text || "Maintenance in progress — some things may be off for a bit."}
          </p>
        )}
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
        {flags?.chat_enabled !== false && <HoundChat />}
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
            <Route path="projects" element={<OsProjects />} />
            <Route path="posts" element={<OsPosts />} />
            <Route path="events" element={<OsEvents />} />
            <Route path="workshops" element={<OsWorkshops />} />
            <Route path="resources" element={<OsResources />} />
            <Route path="members" element={<OsMembers />} />
            <Route path="board" element={<OsBoard />} />
            <Route path="site" element={<OsSite />} />
            <Route path="inheritance" element={<OsInheritance />} />
            <Route path="system" element={<OsSystem />} />
            <Route path="audit" element={<OsAudit />} />
            <Route path="queue" element={<OsProjects />} />
          </Route>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="projects" element={<Projects />} />
            <Route path="apps" element={<Navigate to="/projects" replace />} />
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
