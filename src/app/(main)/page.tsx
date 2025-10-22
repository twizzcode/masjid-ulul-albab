import { Hero1 } from "@/components/ui/hero";

export default function Home() {
  return (
    <section className="flex flex-1 flex-col justify-center items-center">
      <Hero1
        badge="Management System Masjid Ulul Albab ✨"
        heading="Sistem Peminjaman Tempat Masjid Ulul Albab"
        description="Silahkan melakukan peminjaman tempat untuk kegiatan Anda dengan mudah dan cepat melalui sistem online kami."
        buttons={{
          primary: {
            text: "Booking Tempat",
            url: "/booking",
          },
          secondary: {
            text: "Lihat Jadwal",
            url: "/jadwal",
          }
        }}
      />
    </section>
  );
}
