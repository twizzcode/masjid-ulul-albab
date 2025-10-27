import { Hero1 } from "@/components/ui/hero";

export default function Home() {
  return (
    <section className="w-full h-full p-4 lg:p-6 flex justify-center items-center">
      <div className="w-full h-full flex flex-col justify-center max-w-[1400px]">
        <div className="w-full">
          <Hero1
            badge="Management System Masjid Ulul Albab ✨"
            heading="Sistem Peminjaman Tempat Masjid Ulul Albab"
            description="Silahkan melakukan peminjaman tempat untuk kegiatan Anda dengan mudah dan cepat melalui sistem online kami."
            buttons={{
              primary: {
                text: "Booking Tempat",
                url: "/pinjam",
              },
              secondary: {
                text: "Lihat Jadwal",
                url: "/jadwal",
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
