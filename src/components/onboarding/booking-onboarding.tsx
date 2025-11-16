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
import { toast } from "sonner";
import { getStepValidationErrors } from "./booking/validation";

export function BookingOnboarding({
	onComplete,
	defaultValues,
	isSubmitting,
}: BookingOnboardingProps) {
	const {
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
	} = useBookingForm(defaultValues);

	const handleFinish = () => {
		onComplete?.(formData as BookingData);
	};

	const handleNextStep = () => {
		// Validate current step before proceeding
		const errors = getStepValidationErrors(currentStep, formData, scheduleValidation);
		
		if (errors.length > 0) {
			// Show all errors as toast, one by one
			errors.forEach((error, index) => {
				setTimeout(() => {
					toast.error("Validasi Gagal", {
						description: error.message,
						duration: 3000,
					});
				}, index * 100); // Stagger toasts slightly
			});
			return false;
		}
		
		return true;
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
						isCheckingAvailability={isCheckingAvailability}
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
					finishLabel={isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
					onFinish={handleFinish}
					onNextAttempt={handleNextStep}
					disableNext={isSubmitting || isCheckingAvailability}
				/>
			</Onboarding>
		</div>
	);
}