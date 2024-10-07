import { useEffect, useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import LOGO from "assets/pirha_logo_white.png";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import lazyLoad from "lazyLoad";

const TAB_NAV = [
  { id: 0, name: "Sign in" },
  { id: 1, name: "Create account" },
];

const SignInTab = lazyLoad(() => import("./SignIn"));
const CreateAccountTab = lazyLoad(() => import("./CreateAccount"));
const ForgotPasswordPage = lazyLoad(() => import("./ForgotPassword"));

const Form = () => {
  const [forgotPassword, setForgotPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("0");

  const { state } = useLocation();
  const { tab, randomTabId } = state || {};

  useEffect(() => {
    setActiveTab(tab !== undefined ? tab.toString() : "0");
  }, [tab, randomTabId]);

  return (
    <div className="w-full max-w-[31.5rem] mx-auto">
      <img src={LOGO} alt="logo" className="mb-16" />
      <Suspense fallback={<div>Loading...</div>}>
        {forgotPassword ? (
          <ForgotPasswordPage onClick={() => setForgotPassword(false)} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="flex p-1 mb-8 f bg-n-2 rounded-xl dark:bg-n-7">
              {TAB_NAV.map(({ id, name }) => (
                <TabsTrigger
                  className={`flex basis-1/2 h-10 rounded-[0.625rem] base2 font-semibold text-n-4 transition-colors outline-none tap-highlight-color ${
                    activeTab === id.toString() ? "bg-active-color" : ""
                  }`}
                  key={id}
                  value={id.toString()}
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="0">
              <SignInTab onClick={() => setForgotPassword(true)} />
            </TabsContent>
            <TabsContent value="1">
              <CreateAccountTab />
            </TabsContent>
          </Tabs>
        )}
      </Suspense>
    </div>
  );
};

export default Form;
