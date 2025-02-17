import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon } from "lucide-react";

export default function NewDevice() {
  return (
    <>
        <Button className="w-full rounded-full max-w-80" asChild>
          <a>Add a new Matter device <ArrowRightCircleIcon className="ml-auto"/></a>
        </Button>
    </>
  );
}