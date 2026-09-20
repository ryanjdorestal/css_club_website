import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HoundChat } from "@/mascot/HoundChat";

const Home = lazy(() => import("@/pages/Home"));
const Events = lazy(() => import("@/pages/Events"));
const Apps = lazy(() => import("@/pages/Apps"));
const Cyberhounds = lazy(() => import("@/pages/Cyberhounds"));
const About = lazy(() => import("@/pages/About"));
const Resources = lazy(() => import("@/pages/Resources"));
const Join = lazy(() => import("@/pages/Join"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));
const News = lazy(() =>
  import("@/pages/News").then((m) => ({ default: m.NewsIndex })),
);
const NewsArticle = lazy(() =>
  import("@/pages/News").then((m) => ({ default: m.NewsArticle })),
);

/** Route → section accent (brand.config accents; one accent per section). */
const ACCENT_BY_PATH: Record<string, "red" | "green" | "blue" | "teal"> = {
  "/events": "red",
  "/cyberhounds": "red",
  "/apps": "green",
  "/about": "blue",
  "/resources": "blue",
  "/news": "blue",
  "/join": "blue",
};

function Layout() {
  const { pathname } = useLocation();
  const accent =
    Object.entries(ACCENT_BY_PATH).find(([p]) => pathname.startsWith(p))?.[1] ?? "teal";
  return (
    <div data-accent={accent} className="min-h-dvh flex flex-col">
      <Nav />
      <div className="grow">
        <Outlet />
      </div>
      <Footer />
      <HoundChat />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
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
  );
}
