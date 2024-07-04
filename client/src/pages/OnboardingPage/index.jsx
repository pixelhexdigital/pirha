import { useState } from "react";
import pirhaLogo from "assets/pirha_logo_white.png";

import AddMenuPage from "./AddMenuPage";
import CreateTablePage from "./CreateTablePage";
import UpdateProfilePage from "./UpdateProfilePage";
// import UpdateAvatarPage from "./UpdateAvatarPage";
import { Progress } from "components/ui/progress";

const NO_OF_STEPS = 3;

const OnboardingPage = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  // const prevStep = () => setStep((prevStep) => prevStep - 1);

  const progressValue = ((step - 1) / NO_OF_STEPS) * 100;

  const onboardingSteps = [
    {
      title: "",
      content: <UpdateProfilePage nextStep={nextStep} />,
    },
    // {
    //   title: "Update Avatar",
    //   content: <UpdateAvatarPage />,
    // },
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
      <div className="container flex justify-center w-full max-w-[31.5rem] mx-auto">
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
      <button onClick={nextStep} className="btn btn-primary">
        Next
      </button>
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
