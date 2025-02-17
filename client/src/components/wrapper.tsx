import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router";
import { useTranslations } from '@/translations/useTranslations';
import matterLogo from "@/assets/matter-logo.png";

export default function Wrapper() {
  const { translations } = useTranslations();

  return (
    <div className="relative min-h-dvh flex flex-col">
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-12 sm:py-14 mx-auto flex items-center md:flex-row flex-col">
          <div className="flex flex-col md:pr-10 md:mb-0 mb-6 pr-0 w-full md:w-auto md:text-left text-center">
            <h2 className="text-xs text-red-600 tracking-widest font-medium title-font mb-1">
              BY FABRIZZ WITH ❤
            </h2>
            <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900">
              <span className="mr-1">MMM-Matter</span>{" "}
              <img
                src={matterLogo}
                alt=""
                className="inline h-[0.8em] mb-[0.2em] opacity-50"
              />
            </h1>
          </div>
          <div className="flex md:ml-auto md:mr-0 mx-auto items-center flex-shrink-0 space-x-4 -mt-2 sm:mt-0">
            <Button className="w-full rounded-full" variant={"secondary"} asChild>
              <a href="https://mm2.fabriz.co/matter" target="_blank" rel="noreferrer">
                <BookMarked /> {translations?.WEB_OPEN_DOCS}
              </a>
            </Button>
          </div>
        </div>
      </section>
      <Outlet />
    </div>
  );
}