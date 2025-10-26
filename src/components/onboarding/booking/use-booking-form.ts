import { useState, useEffect } from "react";
import { BookingData, ScheduleValidation } from "./types";
import { validateFile, validateStep } from "./validation";

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
  const [scheduleValidation, setScheduleValidation] = useState<ScheduleValidation>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Check schedule availability when location, startDate, or endDate changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.startDate || !formData.endDate || !formData.location) {
        setScheduleValidation(null);
        return;
      }

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      // Validate end time is after start time
      if (end <= start) {
        setScheduleValidation({
          type: "error",
          message: "Waktu selesai harus lebih lama dari waktu mulai",
        });
        return;
      }

      try {
        setIsCheckingAvailability(true);
        
        const response = await fetch("/api/bookings/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: formData.location,
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate.toISOString(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setScheduleValidation({
            type: "error",
            message: data.error || "Gagal memeriksa ketersediaan",
          });
          return;
        }

        if (data.isAvailable) {
          setScheduleValidation({
            type: "success",
            message: "Jadwal tersedia",
          });
        } else {
          setScheduleValidation({
            type: "error",
            message: data.message || "Waktu yang dipilih sudah dibooking",
            conflictingBooking: data.conflictingBooking,
          });
        }
      } catch (error) {
        console.error("Check availability error:", error);
        setScheduleValidation({
          type: "error",
          message: "Gagal memeriksa ketersediaan jadwal",
        });
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [formData.location, formData.startDate, formData.endDate]);

  const updateFormData = (field: keyof BookingData, value: string | Date | File | undefined) => {
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
	setFormData((prev) => ({
		...prev,
		letterFile: undefined,
		letterFileName: "",
	}));
};

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
    isCheckingAvailability,
    updateFormData,
    handleFileChange,
    handleRemoveFile,
    setCurrentStep,
    setStartDateOpen,
    setEndDateOpen,
    canProceedToNextStep,
  };
}
