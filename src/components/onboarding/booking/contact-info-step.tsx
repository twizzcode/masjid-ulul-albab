import { OnboardingStep } from "../onboarding";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { BookingData } from "./types";

interface ContactInfoStepProps {
  formData: Partial<BookingData>;
  onUpdate: (field: keyof BookingData, value: string | Date | File | undefined) => void;
}

export function ContactInfoStep({ formData, onUpdate }: ContactInfoStepProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, dots, apostrophes, and hyphens
    const sanitized = value.replace(/[^a-zA-Z\s.'\-]/g, "");
    onUpdate("contactName", sanitized);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, +, and spaces
    const sanitized = value.replace(/[^\d+\s]/g, "");
    onUpdate("contactPhone", sanitized);
  };

  return (
    <OnboardingStep
      title="Informasi Narahubung"
      description="Masukkan informasi narahubung yang dapat dihubungi"
      icon={<User className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-2">
        <Field>
          <FieldLabel>
            Nama Lengkap <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="Masukkan nama lengkap"
            className="text-xs"
            value={formData.contactName || ""}
            onChange={handleNameChange}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Hanya huruf, spasi, titik, apostrof, dan tanda hubung
          </p>
        </Field>

        <Field>
          <FieldLabel>
            Nomor Kontak <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="08xxxxxxxxxx atau +628xxxxxxxxxx"
            className="text-xs"
            value={formData.contactPhone || ""}
            onChange={handlePhoneChange}
            maxLength={15}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Format: 08xx atau +628xx (10-15 digit)
          </p>
        </Field>
      </div>
    </OnboardingStep>
  );
}
