import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Globe } from "@/components/ui/globe";

const HOME_PATH = "/";

const MARKERS = [
  { location: [46.603354, 1.888334] as [number, number], size: 0.08 },   // France
  { location: [7.539989, -5.54708] as [number, number], size: 0.06 },     // Côte d'Ivoire
  { location: [23.634501, -102.552784] as [number, number], size: 0.07 }, // Mexico
  { location: [35.86166, 104.195397] as [number, number], size: 0.1 },    // China
  { location: [51.165691, 10.451526] as [number, number], size: 0.06 },   // Germany
  { location: [37.09024, -95.712891] as [number, number], size: 0.1 },    // USA
  { location: [36.204824, 138.252924] as [number, number], size: 0.07 },  // Japan
  { location: [35.907757, 127.766922] as [number, number], size: 0.05 },  // South Korea
  { location: [52.132633, 5.291266] as [number, number], size: 0.04 },    // Netherlands
  { location: [-14.235004, -51.925282] as [number, number], size: 0.08 }, // Brazil
  { location: [20.593684, 78.96288] as [number, number], size: 0.08 },    // India
  { location: [56.130366, -106.346771] as [number, number], size: 0.08 }, // Canada
  { location: [-25.274398, 133.775136] as [number, number], size: 0.05 }, // Australia
  { location: [23.424076, 53.847818] as [number, number], size: 0.04 },   // UAE
  { location: [14.058324, 108.277199] as [number, number], size: 0.05 },  // Vietnam
].map((m) => ({ ...m, color: [0.2, 0.5, 1] as [number, number, number] }));

function getConfig(): import("cobe").COBEOptions {
  return {
    width: 800,
    height: 800,
    onRender: () => {},
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [0.92, 0.92, 0.92],
    markerColor: [0.2, 0.5, 1],
    glowColor: [0.9, 0.9, 0.9],
    markers: MARKERS,
  };
}

export const Route = createFileRoute("/_app/login/_layout")({
  component: LoginLayout,
  beforeLoad: () => ({
    title: "Antaios - Connexion",
  }),
});

function LoginLayout() {
  return (
    <div className="flex h-screen w-full">
      <div className="absolute left-1/2 top-10 mx-auto flex -translate-x-1/2 transform lg:hidden">
        <Link
          to={HOME_PATH}
          className="z-10 flex h-10 flex-col items-center justify-center gap-2"
        >
          <Logo />
        </Link>
      </div>
      <div className="relative hidden h-full w-[50%] items-center justify-center overflow-hidden bg-card lg:flex">
        <Link
          to={HOME_PATH}
          className="absolute top-10 left-10 z-10 flex h-10 w-10 items-center gap-1"
        >
          <Logo />
        </Link>

        <div className="relative aspect-square w-full max-w-[650px]">
          <Globe config={getConfig()} />
        </div>
      </div>
      <div className="flex h-full w-full flex-col border-l border-primary/5 bg-card lg:w-[50%]">
        <Outlet />
      </div>
    </div>
  );
}
