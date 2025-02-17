import { Loader2, OctagonAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { Router } from "lucide-react";

export default function DeviceGrid() {
  const [data, setData] = useState<"" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch("/matter/api/devices");
        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }
        const result: "" = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="container px-5 mx-auto flex justify-center items-center">
      <Loader2 className="animate-spin" />
    </div>;
  }

  if (false && error) {
    return (
      <div className="container px-5 mx-auto flex bg-red-100 rounded-2xl p-4">
        <OctagonAlert className="text-red-500 mr-3" />
        An error ocurred while fetching devices
      </div>
    );
  }

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 mx-auto flex flex-col gap-4">
        <div className="grid gap-4 grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 w-full">
          <div className="hover:scale-[.994] active:scale-[.98] transition-transform col-span-3 md:col-span-4 bg-gradient-to-r from-slate-900 to-slate-600 text-white rounded-2xl min-h-32 relative">
            <div className="px-5 py-4 flex justify-end flex-col h-full">
              <span className="font-medium text-2xl">Matter Bridge</span>
              <span className="text-white/80 text-sm">20202021</span>
            </div>
            <div className="absolute inset-4">
              <Router className="ml-auto" />
            </div>
          </div>

          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
          <div className="aspect-square bg-emerald-50 rounded-2xl"></div>
        </div>
      </div>
    </section>
  );
}
