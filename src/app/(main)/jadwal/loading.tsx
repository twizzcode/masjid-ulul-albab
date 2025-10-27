import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Loading() {
  return (
    <section className="w-full h-full p-4 lg:p-6">
      <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-hidden flex flex-col">
        <LoadingScreen message="Memuat jadwal..." />
      </div>
    </section>
  );
}
