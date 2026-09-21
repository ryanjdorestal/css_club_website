/** Home — composition only. Each section lives in pages/home/ and carries its
    own cube-rail keyframe. Order here = the page order. */
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
