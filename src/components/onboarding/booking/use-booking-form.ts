import { useState } from "react";
import { BookingData } from "./types";
import { validateFile, validateSchedule, validateStep } from "./validation";

export function useBookingForm(defaultValues?: Partial<BookingData>) {
  const [formData, setFormData] = useState<Partial<BookingData>>({
    contactName: defaultValues?.contactName || "",
    contactPhone: defaultValues?.contactPhone || "",
    organizerName: defaultValues?.organizerName || "",
    eventName: defaultValues?.eventName || "",
    startDate: defaultValues?.startDate,
    endDate: defaultValues?.endDate,
    letterFile: undefined,
    letterFileName: "",
    location: defaultValues?.location || "",
  });

  const [fileError, setFileError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const updateFormData = (field: keyof BookingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      e.target.value = "";
      return;
    }

    updateFormData("letterFile", file);
    updateFormData("letterFileName", file.name);
  };

  const handleRemoveFile = () => {
    updateFormData("letterFile", undefined);
    updateFormData("letterFileName", "");
    setFileError("");
  };

  const scheduleValidation = validateSchedule(
    formData.startDate,
    formData.endDate
  );

  const canProceedToNextStep = (step: number): boolean => {
    return validateStep(step, formData, scheduleValidation);
  };

  return {
    formData,
    fileError,
    currentStep,
    startDateOpen,
    endDateOpen,
    scheduleValidation,
    updateFormData,
    handleFileChange,
    handleRemoveFile,
    setCurrentStep,
    setStartDateOpen,
    setEndDateOpen,
    canProceedToNextStep,
  };
}
