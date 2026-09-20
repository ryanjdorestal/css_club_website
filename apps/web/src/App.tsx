import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const Styleguide = lazy(() => import("@/pages/Styleguide"));

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
    </div>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <main className="max-w-6xl mx-auto px-5 py-24">
      <p className="mono-label text-(--accent)">{"//"} under construction</p>
      <h1 className="font-display font-black uppercase text-5xl mt-2" style={{ fontStretch: "115%" }}>
        {name}
      </h1>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Placeholder name="Home" />} />
          <Route path="events" element={<Placeholder name="Events" />} />
          <Route path="apps" element={<Placeholder name="Apps" />} />
          <Route path="cyberhounds" element={<Placeholder name="Cyberhounds" />} />
          <Route path="about" element={<Placeholder name="About" />} />
          <Route path="resources" element={<Placeholder name="Resources" />} />
          <Route path="news" element={<Placeholder name="News" />} />
          <Route path="join" element={<Placeholder name="Join" />} />
          <Route path="styleguide" element={<Styleguide />} />
          <Route path="*" element={<Placeholder name="404" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
