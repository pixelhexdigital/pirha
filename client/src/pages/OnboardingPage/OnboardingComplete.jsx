import { ArrowRight, PartyPopper } from "lucide-react";

import { Button } from "components/ui/button";

// Shown once setup finishes — the payoff moment. Names the "aha" (a live QR
// menu) so owners know exactly what they just switched on.
const OnboardingComplete = ({ onGoToDashboard }) => {
  return (
    <div className="max-w-md px-4 mx-auto mt-6 text-center animate-in fade-in duration-300">
      <div className="flex items-center justify-center mx-auto mb-6 rounded-full size-16 bg-success/10 animate-in zoom-in-50 duration-500">
        <PartyPopper className="size-8 text-success" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-foreground text-balance">
        You&apos;re all set!
      </h1>
      <p className="mt-3 text-muted-foreground text-pretty">
        Your restaurant is live. Guests can scan a table&apos;s QR code to browse
        your menu and order — and every ticket flows straight to your kitchen.
      </p>
      <Button size="lg" className="w-full mt-8" onClick={onGoToDashboard}>
        Go to dashboard
        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        You can fine-tune your menu, tables, and profile anytime from the
        dashboard.
      </p>
    </div>
  );
};

export default OnboardingComplete;
