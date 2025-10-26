import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Loading() {
  return (
    <section className="flex flex-1 w-full p-4">
      <div className="w-full h-full flex flex-col border rounded-xl overflow-hidden">
        <LoadingScreen message="Memuat jadwal..." />
      </div>
    </section>
  );
}
