"use client";

import {
  Onboarding,
  OnboardingHeader,
  OnboardingTitle,
  OnboardingDescription,
  OnboardingSteps,
  OnboardingIndicator,
  OnboardingActions,
} from "./onboarding";
import { BookingOnboardingProps, BookingData } from "./booking/types";
import { useBookingForm } from "./booking/use-booking-form";
import { ContactInfoStep } from "./booking/contact-info-step";
import { EventDetailsStep } from "./booking/event-details-step";
import { ScheduleStep } from "./booking/schedule-step";
import { ConfirmationStep } from "./booking/confirmation-step";

export function BookingOnboarding({ onComplete, defaultValues }: BookingOnboardingProps) {
  const {
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
  } = useBookingForm(defaultValues);

  const handleFinish = () => {
    onComplete?.(formData as BookingData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Onboarding defaultStep={0} onStepChange={setCurrentStep}>
        <OnboardingHeader>
          <OnboardingTitle>Ajukan Peminjaman Tempat</OnboardingTitle>
          <OnboardingDescription>
            Lengkapi informasi berikut untuk mengajukan peminjaman tempat
          </OnboardingDescription>
        </OnboardingHeader>

        <OnboardingIndicator className="mb-8" showNumbers />

        <OnboardingSteps>
          <ContactInfoStep formData={formData} onUpdate={updateFormData} />

          <EventDetailsStep
            formData={formData}
            fileError={fileError}
            onUpdate={updateFormData}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />

          <ScheduleStep
            formData={formData}
            scheduleValidation={scheduleValidation}
            startDateOpen={startDateOpen}
            endDateOpen={endDateOpen}
            onUpdate={updateFormData}
            onStartDateOpenChange={setStartDateOpen}
            onEndDateOpenChange={setEndDateOpen}
          />

          <ConfirmationStep formData={formData} />
        </OnboardingSteps>

        <OnboardingActions
          className="mt-8"
          backLabel="Kembali"
          nextLabel="Lanjutkan"
          finishLabel="Kirim Pengajuan"
          onFinish={handleFinish}
          disableNext={!canProceedToNextStep(currentStep)}
        />
      </Onboarding>
    </div>
  );
}