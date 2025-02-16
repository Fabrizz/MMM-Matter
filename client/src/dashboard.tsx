import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import logo from "@/assets/wide-start-logo.png";
import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon } from "lucide-react";
import DeviceGrid from "./components/device-grid";

export default function Dashboard() {
  return (
    <>
      <StarsBackground dark={false} />
      <ShootingStars className="" starColor="#000000" trailColor="#524740"/>
      <div className="min-h-dvh flex flex-col">
        <div className="flex flex-col items-center justify-center bg-green-600/5">
          <img src={logo} alt="logo" className="mt-10 block max-w-80 h-16 sm:h-auto" />
        </div>
        <div className="flex-[4] bg-cyan-600/5">
        <DeviceGrid />
        </div>
        <div className="mt-4 flex flex-col justify-center items-center gap-2 w-full mb-12">
          <Button className="w-full rounded-full max-w-80" asChild>
             <a>Add a new Matter device <ArrowRightCircleIcon className="ml-auto"/></a>
          </Button>
          <span className="text-gray-900/50">By Fabrizz with ❤</span>
        </div>
      </div>
    </>
  );
}