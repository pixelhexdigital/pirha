import React, { useState } from "react";
import UpdateProfilePage from "./UpdateProfilePage";
// import UpdateAvatarPage from "./UpdateAvatarPage";
import CreateTablePage from "./CreateTablePage";
import AddMenuPage from "./AddMenuPage";

import { Button } from "components/ui/button";

import pirhaLogo from "assets/pirha_logo_white.png";

const OnboardingPage = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  return (
    <div>
      <Header></Header>
      <div className="container flex justify-center align-middle w-full max-w-[31.5rem] mx-auto">
        {step === 1 && <UpdateProfilePage nextStep={nextStep} />}
        {/* {step === 2 && <UpdateAvatarPage nextStep={nextStep} />} */}
        {step === 2 && <CreateTablePage nextStep={nextStep} />}
        {step === 3 && <AddMenuPage nextStep={nextStep} />}
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="bg-white flex-col shadow-md p-4 mb-6 flex items-center justify-between">
      <img src={pirhaLogo} alt="Pirha Logo" className="h-12 w-auto" />
      <h1 className="text-xl font-semibold text-gray-800">Welcome!</h1>
      {/* <p>
        Please complete these steps to set up your restaurant and get started.
      </p> */}
    </div>
  );
};

export default OnboardingPage;
