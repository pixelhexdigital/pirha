import { useState } from "react";
import { useSelector } from "react-redux";
import { MailWarning, X } from "lucide-react";

import { Button } from "components/ui/button";
import { ButtonSpinner } from "components/Spinner";
import { useResendEmailVerificationMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";
import {
  selectIsAuthenticated,
  selectIsEmailVerified,
  selectUserRole,
} from "store/AuthSlice";

const DISMISS_KEY = "pirha:verifyEmailDismissed";

// Soft nudge shown to signed-in staff whose email isn't verified yet. Login is
// not blocked; this just offers a one-click resend. Dismissal lasts the session.
const VerifyEmailBanner = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isEmailVerified = useSelector(selectIsEmailVerified);
  const userRole = useSelector(selectUserRole);

  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1"
  );
  const [resend, { isLoading }] = useResendEmailVerificationMutation();

  const shouldShow =
    isAuthenticated &&
    userRole === "RESTAURANT_ADMIN" &&
    !isEmailVerified &&
    !dismissed;

  if (!shouldShow) return null;

  const handleResend = async () => {
    try {
      await resend().unwrap();
      successToast({ message: "Verification email sent — check your inbox." });
    } catch (error) {
      errorToast({ error, message: "Couldn't send the email. Please try again." });
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 mb-4 border rounded-lg bg-warning/10 border-warning/20">
      <MailWarning className="size-5 text-warning shrink-0" aria-hidden="true" />
      <p className="flex-1 min-w-[12rem] text-sm text-foreground">
        <span className="font-medium">Verify your email</span> to secure your
        account. Check your inbox for the verification link.
      </p>
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading}
        onClick={handleResend}
      >
        {isLoading ? <ButtonSpinner /> : "Resend email"}
      </Button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="p-1 transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-warning/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
