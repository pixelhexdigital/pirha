import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";

import Wordmark from "components/Wordmark";
import AddMenuPage from "./AddMenuPage";
import CreateTablePage from "./CreateTablePage";
import UpdateProfilePage from "./UpdateProfilePage";
import OnboardingComplete from "./OnboardingComplete";
import { selectOnboardingState, setOnboardingState } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";

const ONBOARDING_STATE = {
  NEW: "NEW",
  TABLE: "TABLE",
  MENU: "MENU",
  COMPLETED: "COMPLETED",
};

const STEPS = [
  {
    label: "Profile",
    title: "Set up your restaurant",
    subtitle: "Tell us the basics. You can refine any of this later.",
  },
  {
    label: "Tables",
    title: "Add your tables",
    subtitle:
      "We'll generate a QR code for each table so guests can order from their seat.",
  },
  {
    label: "Menu",
    title: "Build your menu",
    subtitle:
      "Add a few categories and dishes to go live — you can always add more later.",
  },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentOnboardingStep = useSelector(selectOnboardingState);

  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (currentOnboardingStep === ONBOARDING_STATE.TABLE) {
      setStep(2);
    } else if (currentOnboardingStep === ONBOARDING_STATE.MENU) {
      setStep(3);
    } else if (currentOnboardingStep === ONBOARDING_STATE.COMPLETED) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      setStep(1);
    }
  }, [currentOnboardingStep, navigate]);

  const nextStep = () => {
    if (step === 1) {
      dispatch(setOnboardingState(ONBOARDING_STATE.TABLE));
    } else if (step === 2) {
      dispatch(setOnboardingState(ONBOARDING_STATE.MENU));
    }
    setStep((prev) => prev + 1);
  };

  const goToDashboard = () => {
    dispatch(setOnboardingState(ONBOARDING_STATE.COMPLETED));
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  const stepContent = [
    <UpdateProfilePage key="profile" nextStep={nextStep} />,
    <CreateTablePage key="tables" onNext={nextStep} />,
    <AddMenuPage key="menu" onComplete={() => setCompleted(true)} />,
  ];
  const current = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-center h-16 border-b bg-card">
        <Wordmark className="text-xl text-foreground" />
      </header>

      <main className="w-full max-w-xl px-4 py-8 mx-auto sm:py-10">
        {completed ? (
          <OnboardingComplete onGoToDashboard={goToDashboard} />
        ) : (
          <>
            <StepIndicator currentStep={step} steps={STEPS} />
            <div
              key={step}
              className="p-6 mt-8 border shadow-sm bg-card rounded-xl sm:p-8 animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground text-balance">
                  {current.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  {current.subtitle}
                </p>
              </div>
              {stepContent[step - 1]}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <ol className="flex items-center justify-between">
      {steps.map(({ label }, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <li key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={twMerge(
                  "flex items-center justify-center border-2 rounded-full size-9 text-sm font-semibold transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "border-primary text-primary bg-primary/10",
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
                {label}
              </span>
            </div>
            {stepNum < steps.length && (
              <div
                className={twMerge(
                  "flex-1 h-0.5 mx-3 mt-[-1rem] rounded-full transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default OnboardingPage;
