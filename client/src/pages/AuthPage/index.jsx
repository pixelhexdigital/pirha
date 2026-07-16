import Form from "./Form";
import AuthHero from "./AuthHero";
import Wordmark from "components/Wordmark";
import ThemeToggleButton from "components/ThemeToggle/ThemeToggleButton";

const AuthPage = () => {
  return (
    <div className="relative flex min-h-screen">
      <div className="absolute z-10 top-4 right-4">
        <ThemeToggleButton />
      </div>

      <AuthHero />

      <div className="flex items-center justify-center flex-1 p-6 bg-background">
        <div className="w-full max-w-[26rem] duration-500 animate-in fade-in slide-in-from-bottom-2">
          <div className="mb-8 text-center lg:hidden">
            <Wordmark className="text-2xl text-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Run your entire restaurant from one simple system.
            </p>
          </div>
          <Form />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
