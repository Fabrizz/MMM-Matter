import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";

export default function Home() {
  return (
    <>
      <StarsBackground dark={false} />
      <ShootingStars className="" starColor="#000000" trailColor="#524740" />
      <section className="text-gray-600 body-font">
        hellO!
      </section>
    </>
  );
}
