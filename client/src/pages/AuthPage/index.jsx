import LOGO from "assets/pirha_logo_white.png";
import Form from "./Form";
import ThemeToggleButton from "components/ThemeToggle/ThemeToggleButton";

const AuthPage = () => {
  return (
    <div className="relative flex min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img src={LOGO} alt="Pirha Logo" className="h-12 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Manage your restaurant with ease
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Streamline orders, manage tables, and delight your customers with
            Pirha&apos;s all-in-one restaurant management platform.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[28rem]">
          <div className="lg:hidden mb-8 text-center">
            <img src={LOGO} alt="Pirha Logo" className="h-10 mx-auto mb-4" />
          </div>
          <Form />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
