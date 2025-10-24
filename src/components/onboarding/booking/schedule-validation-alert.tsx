import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScheduleValidation } from "./types";

interface ScheduleValidationAlertProps {
  validation: ScheduleValidation;
}

export function ScheduleValidationAlert({
  validation,
}: ScheduleValidationAlertProps) {
  const router = useRouter();

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
        <p
          className={`text-sm flex-1 ${
            validation.type === "error"
              ? "text-red-700 dark:text-red-400"
              : "text-green-700 dark:text-green-400"
          }`}
        >
          {validation.type === "error" ? "⚠️" : "✓"} {validation.message}
        </p>
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
