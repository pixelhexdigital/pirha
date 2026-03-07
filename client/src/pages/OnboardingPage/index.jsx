import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";

import pirhaLogo from "assets/pirha_logo_white.png";

import AddMenuPage from "./AddMenuPage";
import CreateTablePage from "./CreateTablePage";
import UpdateProfilePage from "./UpdateProfilePage";
import { selectOnboardingState, setOnboardingState } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";

const ONBOARDING_STATE = {
  NEW: "NEW",
  TABLE: "TABLE",
  MENU: "MENU",
  COMPLETED: "COMPLETED",
};

const STEP_LABELS = ["Profile", "Tables", "Menu"];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentOnboardingStep = useSelector(selectOnboardingState);

  const [step, setStep] = useState(1);

  useEffect(() => {
    if (currentOnboardingStep === ONBOARDING_STATE.NEW) {
      setStep(1);
    } else if (currentOnboardingStep === ONBOARDING_STATE.TABLE) {
      setStep(2);
    } else if (currentOnboardingStep === ONBOARDING_STATE.MENU) {
      setStep(3);
    } else if (currentOnboardingStep === ONBOARDING_STATE.COMPLETED) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [currentOnboardingStep, navigate]);

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
    if (step === 1) {
      dispatch(setOnboardingState(ONBOARDING_STATE.TABLE));
    } else if (step === 2) {
      dispatch(setOnboardingState(ONBOARDING_STATE.MENU));
    } else if (step > 2) {
      dispatch(setOnboardingState(ONBOARDING_STATE.COMPLETED));
    }
  };

  const onboardingSteps = [
    {
      title: "",
      content: <UpdateProfilePage nextStep={nextStep} />,
    },
    {
      title: "Create Tables",
      content: <CreateTablePage onNext={nextStep} />,
    },
    {
      title: "Create Menus",
      content: <AddMenuPage onNext={nextStep} />,
    },
  ];

  return (
    <>
      <Header />
      <div className="w-full max-w-xl mx-auto px-4 mt-6 mb-4">
        <StepIndicator currentStep={step} totalSteps={3} labels={STEP_LABELS} />
      </div>
      <div className="container flex justify-center w-full max-w-xl mx-auto">
        {onboardingSteps.map(({ content, title }, index) => {
          if (index + 1 === step) {
            return (
              <div key={index} className="w-full">
                <h2 className="pl-4 mb-4 text-2xl font-bold">{title}</h2>
                {content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </>
  );
};

const Header = () => {
  return (
    <div className="flex flex-col items-center justify-between p-4 bg-card border-b shadow-sm">
      <img src={pirhaLogo} alt="Pirha Logo" className="w-auto h-12" />
      <h1 className="text-xl font-semibold text-foreground mt-2">Welcome!</h1>
    </div>
  );
};

const StepIndicator = ({ currentStep, totalSteps, labels }) => {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={twMerge(
                  "flex items-center justify-center size-9 rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted &&
                    "bg-primary border-primary text-primary-foreground",
                  isActive &&
                    "border-primary text-primary bg-primary/10",
                  !isCompleted &&
                    !isActive &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : stepNum}
              </div>
              <span
                className={twMerge(
                  "text-xs mt-1.5 font-medium",
                  isActive
                    ? "text-primary"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {labels[i]}
              </span>
            </div>
            {stepNum < totalSteps && (
              <div
                className={twMerge(
                  "flex-1 h-0.5 mx-3 mt-[-1rem]",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OnboardingPage;
