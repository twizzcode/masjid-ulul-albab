import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScheduleValidation } from "./types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ScheduleValidationAlertProps {
  validation: ScheduleValidation;
  isChecking?: boolean;
}

export function ScheduleValidationAlert({
  validation,
  isChecking = false,
}: ScheduleValidationAlertProps) {
  const router = useRouter();

  if (isChecking) {
    return (
      <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          🔍 Memeriksa ketersediaan jadwal...
        </p>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div
      className={`rounded-lg border p-3 ${
        validation.type === "error"
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              validation.type === "error"
                ? "text-red-700 dark:text-red-400"
                : "text-green-700 dark:text-green-400"
            }`}
          >
            {validation.type === "error" ? "⚠️" : "✓"} {validation.message}
          </p>
          
          {validation.type === "error" && (validation as any).conflictingBooking && (
            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800 space-y-1">
              <p className="text-xs text-red-600 dark:text-red-500 font-semibold">
                Booking yang bentrok:
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                📌 {(validation as any).conflictingBooking.eventName}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                🏢 {(validation as any).conflictingBooking.organizerName}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date((validation as any).conflictingBooking.startDate), "dd MMM yyyy, HH:mm", { locale: id })} - {format(new Date((validation as any).conflictingBooking.endDate), "HH:mm", { locale: id })}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                Status: {(validation as any).conflictingBooking.status === "approved" ? "Disetujui" : "Menunggu Persetujuan"}
              </p>
            </div>
          )}
        </div>
        
        {validation.type === "error" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8 shrink-0 border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/40"
            onClick={() => router.push("/jadwal")}
          >
            <Calendar className="w-3 h-3 mr-1.5" />
            Cek Jadwal
          </Button>
        )}
      </div>
    </div>
  );
}
