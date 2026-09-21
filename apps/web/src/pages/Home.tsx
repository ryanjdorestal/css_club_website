/** The home page (`/`). This file only decides the ORDER of the sections; each section is its own
    component under pages/home/ (HomeHero, HomeEvents, …), and each reads its data the same way every
    public page does: `useApi(path, bundledJson)` — the committed JSON first, the API's copy when it
    arrives. The 3D cube rides along the page on the CubeRail; a section tells the rail where the cube
    should be when that section is on screen. To add a section: make a component in pages/home/, import
    it here, put it in the list. */
import { CubeRail } from "@/cube/CubeRail";
import { CubeRailProvider } from "@/cube/CubeRailContext";
import { HomeHero } from "./home/HomeHero";
import { HomeAbout } from "./home/HomeAbout";
import { HomeEvents } from "./home/HomeEvents";
import { HomeProjects } from "./home/HomeProjects";
import { HomeResources } from "./home/HomeResources";
import { HomeCyberhounds } from "./home/HomeCyberhounds";
import { HomeJoin } from "./home/HomeJoin";
import { HomeGallery } from "./home/HomeGallery";
import { HomePartners } from "./home/HomePartners";
import { HomeFin } from "./home/HomeFin";

export default function Home() {
  return (
    <CubeRailProvider>
      <CubeRail />
      <main className="relative">
        <HomeHero />
        <HomeAbout />
        <HomeEvents />
        <HomeProjects />
        <HomeResources />
        <HomeCyberhounds />
        <HomeJoin />
        <HomeGallery />
        <HomePartners />
        <HomeFin />
      </main>
    </CubeRailProvider>
  );
}
