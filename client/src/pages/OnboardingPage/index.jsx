import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import pirhaLogo from "assets/pirha_logo_white.png";

import AddMenuPage from "./AddMenuPage";
import CreateTablePage from "./CreateTablePage";
import UpdateProfilePage from "./UpdateProfilePage";
import { Progress } from "components/ui/progress";
import { selectOnboardingState, setOnboardingState } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";

const NO_OF_STEPS = 3;
const ONBOARDING_STATE = {
  NEW: "NEW",
  TABLE: "TABLE",
  MENU: "MENU",
  COMPLETED: "COMPLETED",
};

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
  // const prevStep = () => setStep((prevStep) => prevStep - 1);

  const progressValue = ((step - 1) / NO_OF_STEPS) * 100;

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
      <Progress value={progressValue} className="w-full mb-6" />
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
    <div className="flex flex-col items-center justify-between p-4 bg-white shadow-md">
      <img src={pirhaLogo} alt="Pirha Logo" className="w-auto h-12" />
      <h1 className="text-xl font-semibold text-gray-800">Welcome!</h1>
    </div>
  );
};

export default OnboardingPage;
