"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingContextValue {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const OnboardingContext = React.createContext<OnboardingContextValue | undefined>(
  undefined
);

function useOnboarding() {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within Onboarding component");
  }
  return context;
}

interface OnboardingProps {
  children: React.ReactNode;
  className?: string;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
}

function Onboarding({
  children,
  className,
  defaultStep = 0,
  onStepChange,
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = React.useState(defaultStep);
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  const nextStep = React.useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, totalSteps, onStepChange]);

  const prevStep = React.useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange]
  );

  const value = React.useMemo(
    () => ({
      currentStep,
      totalSteps,
      nextStep,
      prevStep,
      goToStep,
      canGoNext: currentStep < totalSteps - 1,
      canGoPrev: currentStep > 0,
    }),
    [currentStep, totalSteps, nextStep, prevStep, goToStep]
  );

  return (
    <OnboardingContext.Provider value={value}>
      <div className={cn("w-full", className)}>{children}</div>
    </OnboardingContext.Provider>
  );
}

interface OnboardingHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function OnboardingHeader({ children, className }: OnboardingHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {children}
    </div>
  );
}

interface OnboardingTitleProps {
  children: React.ReactNode;
  className?: string;
}

function OnboardingTitle({ children, className }: OnboardingTitleProps) {
  return (
    <h2 className={cn("text-2xl font-bold tracking-tight", className)}>
      {children}
    </h2>
  );
}

interface OnboardingDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

function OnboardingDescription({
  children,
  className,
}: OnboardingDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

interface OnboardingStepsProps {
  children: React.ReactNode;
  className?: string;
}

function OnboardingSteps({ children, className }: OnboardingStepsProps) {
  const { currentStep } = useOnboarding();
  const steps = React.Children.toArray(children);

  return (
    <div className={cn("relative", className)}>
      {steps.map((step, index) => {
        if (index === currentStep) {
          return (
            <div key={index}>
              {step}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

interface OnboardingStepProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  description?: string;
}

function OnboardingStep({ children, className, title, icon, description }: OnboardingStepProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || icon) && (
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {icon}
            </div>
          )}
          {title && (
            <div className="flex-1">
              <h3 className="text-md font-semibold">{title}</h3>
              <h6 className="text-xs text-muted-foreground">{description}</h6>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface OnboardingIndicatorProps {
  className?: string;
  showNumbers?: boolean;
}

function OnboardingIndicator({ className, showNumbers = false }: OnboardingIndicatorProps) {
  const { currentStep, totalSteps } = useOnboarding();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-300",
            index === currentStep
              ? "bg-foreground"
              : index < currentStep
              ? "bg-foreground"
              : "bg-border"
          )}
        />
      ))}
      {showNumbers && (
        <span className="ml-2 text-sm text-muted-foreground">
          {currentStep + 1} / {totalSteps}
        </span>
      )}
    </div>
  );
}

interface OnboardingActionsProps {
  children?: React.ReactNode;
  className?: string;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  onFinish?: () => void;
  hideBack?: boolean;
  hideNext?: boolean;
  disableNext?: boolean;
}

function OnboardingActions({
  children,
  className,
  backLabel = "Back",
  nextLabel = "Continue",
  finishLabel = "Finish",
  onFinish,
  hideBack = false,
  hideNext = false,
  disableNext = false,
}: OnboardingActionsProps) {
  const { currentStep, totalSteps, nextStep, prevStep, canGoNext, canGoPrev } =
    useOnboarding();

  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep && onFinish) {
      onFinish();
    } else {
      nextStep();
    }
  };

  if (children) {
    return <div className={cn("flex gap-3", className)}>{children}</div>;
  }

  return (
    <div className={cn("flex gap-3", className)}>
      {!hideBack && (
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={!canGoPrev}
          className={cn(!canGoPrev && "invisible")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {backLabel}
        </Button>
      )}
      {!hideNext && (
        <Button 
          onClick={handleNext} 
          disabled={disableNext || hideNext || (!canGoNext && !isLastStep)} 
          className={cn("ml-auto", disableNext && "opacity-50 cursor-not-allowed")}
        >
          {isLastStep ? finishLabel : nextLabel}
          {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      )}
    </div>
  );
}

export {
  Onboarding,
  OnboardingHeader,
  OnboardingTitle,
  OnboardingDescription,
  OnboardingSteps,
  OnboardingStep,
  OnboardingIndicator,
  OnboardingActions,
  useOnboarding,
};
