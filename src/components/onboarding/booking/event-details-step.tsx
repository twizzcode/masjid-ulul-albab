import { OnboardingStep } from "../onboarding";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { BookingData } from "./types";
import { FileUploadField } from "./file-upload-field";

interface EventDetailsStepProps {
  formData: Partial<BookingData>;
  fileError: string;
  onUpdate: (field: keyof BookingData, value: string | Date | File | undefined) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export function EventDetailsStep({
  formData,
  fileError,
  onUpdate,
  onFileChange,
  onRemoveFile,
}: EventDetailsStepProps) {
  return (
    <OnboardingStep
      title="Detail Kegiatan"
      description="Masukkan detail kegiatan yang akan dilaksanakan"
      icon={<FileText className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        <Field>
          <FieldLabel>
            Nama Penyelenggara <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="Contoh: UKKI UNNES, HIMA Matematika, UKM Penelitian, dll"
            className="text-xs"
            value={formData.organizerName}
            onChange={(e) => onUpdate("organizerName", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>
            Nama Kegiatan <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="Contoh: Kajian Rutin, Upgrading, Workshop, dll"
            className="text-xs"
            value={formData.eventName}
            onChange={(e) => onUpdate("eventName", e.target.value)}
          />
        </Field>

		<FileUploadField
			fileName={formData.letterFileName}
			onFileChange={onFileChange}
			onRemove={onRemoveFile}
			error={fileError}
		/>
      </div>
    </OnboardingStep>
  );
}
