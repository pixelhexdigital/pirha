import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";

// import LogoImg from "assets/svg/logo.svg";

import SignInTab from "./SignIn";
import CreateAccountTab from "./CreateAccount";
import ForgotPasswordPage from "./ForgotPassword";

const TAB_NAV = [
  {
    id: 0,
    name: "Sign in",
  },
  {
    id: 1,
    name: "Create account",
  },
];

const Form = () => {
  const [forgotPassword, setForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { state } = useLocation();
  const tab = state?.tab;

  useEffect(() => {
    setActiveTab(tab || 0);
  }, [tab]);

  return (
    <div className="w-full max-w-[31.5rem] mx-auto">
      {forgotPassword ? (
        <ForgotPasswordPage onClick={() => setForgotPassword(false)} />
      ) : (
        <Tabs defaultValue={0}>
          <TabsList className="flex p-1 mb-8 f bg-n-2 rounded-xl dark:bg-n-7">
            {TAB_NAV.map(({ id, name }) => {
              return (
                <TabsTrigger
                  className="flex basis-1/2 h-10 rounded-[0.625rem] base2 font-semibold text-n-4 transition-colors outline-none tap-highlight-color"
                  key={id}
                  value={id}
                  onClick={() => setActiveTab(id)}
                >
                  {name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={0}>
            <SignInTab onClick={() => setForgotPassword(true)} />
          </TabsContent>
          <TabsContent value={1}>
            <CreateAccountTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Form;
