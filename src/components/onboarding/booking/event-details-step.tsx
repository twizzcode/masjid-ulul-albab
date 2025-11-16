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
  const handleOrganizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow letters, numbers, spaces, and common punctuation for organization names
    const sanitized = value.replace(/[^a-zA-Z0-9\s.,\-()]/g, "");
    onUpdate("organizerName", sanitized);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow letters, numbers, spaces, and common punctuation for event names
    const sanitized = value.replace(/[^a-zA-Z0-9\s.,\-()]/g, "");
    onUpdate("eventName", sanitized);
  };

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
            value={formData.organizerName || ""}
            onChange={handleOrganizerChange}
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Huruf, angka, spasi, dan tanda baca (minimal 3 karakter)
          </p>
        </Field>

        <Field>
          <FieldLabel>
            Nama Kegiatan <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="Contoh: Kajian Rutin, Upgrading, Workshop, dll"
            className="text-xs"
            value={formData.eventName || ""}
            onChange={handleEventChange}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Huruf, angka, spasi, dan tanda baca (minimal 5 karakter)
          </p>
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
