import { useEffect, useState, Suspense } from "react";
import { useLocation } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import Spinner from "components/Spinner";
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
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-2">
        {forgotPassword
          ? "Reset password"
          : activeTab === "0"
            ? "Welcome back"
            : "Get started"}
      </h1>
      <p className="text-muted-foreground mb-6">
        {forgotPassword
          ? "Enter your email to reset your password"
          : activeTab === "0"
            ? "Sign in to your account to continue"
            : "Create a new account to get started"}
      </p>
      <Suspense fallback={<Spinner className="py-12" />}>
        {forgotPassword ? (
          <ForgotPasswordPage onClick={() => setForgotPassword(false)} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="flex p-1 mb-8 rounded-lg w-full">
              {TAB_NAV.map(({ id, name }) => (
                <TabsTrigger
                  className="flex-1 h-9"
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
