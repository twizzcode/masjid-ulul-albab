import { OnboardingStep } from "../onboarding";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { BookingData } from "./types";

interface ContactInfoStepProps {
  formData: Partial<BookingData>;
  onUpdate: (field: keyof BookingData, value: any) => void;
}

export function ContactInfoStep({ formData, onUpdate }: ContactInfoStepProps) {
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
            value={formData.contactName}
            onChange={(e) => onUpdate("contactName", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>
            Nomor Kontak <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="Nomor WhatsApp"
            type="number"
            className="text-xs"
            value={formData.contactPhone}
            onChange={(e) => onUpdate("contactPhone", e.target.value)}
          />
        </Field>
      </div>
    </OnboardingStep>
  );
}
