import { OnboardingStep } from "../onboarding";
import { CheckCircle } from "lucide-react";
import { BookingData } from "./types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ConfirmationStepProps {
  formData: Partial<BookingData>;
}

const getLocationName = (location?: string) => {
  switch (location) {
    case "aula-lantai-1":
      return "Aula Lantai 1";
    case "aula-lantai-2":
      return "Aula Lantai 2";
    default:
      return "-";
  }
};

export function ConfirmationStep({ formData }: ConfirmationStepProps) {
  return (
    <OnboardingStep
      title="Konfirmasi"
      description="Periksa kembali informasi yang dimasukkan"
      icon={<CheckCircle className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Nama Narahubung</p>
            <p className="text-sm font-semibold">
              {formData.contactName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kontak</p>
            <p className="text-sm font-semibold">
              {formData.contactPhone || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nama Penyelenggara</p>
            <p className="text-sm font-semibold">
              {formData.organizerName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nama Kegiatan</p>
            <p className="text-sm font-semibold">{formData.eventName || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Surat Peminjaman</p>
            <p className="text-sm font-semibold">
              {formData.letterFileName || "Belum dilampirkan"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lokasi Tempat</p>
            <p className="text-sm font-semibold">
              {getLocationName(formData.location)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Waktu Mulai</p>
            <p className="text-sm font-semibold">
              {formData.startDate
                ? format(formData.startDate, "dd MMMM yyyy, HH:mm", {
                    locale: id,
                  })
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Waktu Selesai</p>
            <p className="text-sm font-semibold">
              {formData.endDate
                ? format(formData.endDate, "dd MMMM yyyy, HH:mm", { locale: id })
                : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            Pengajuan Anda akan direview oleh admin.
            <br />
            Anda akan mendapat notifikasi setelah pengajuan disetujui atau
            ditolak.
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
}
