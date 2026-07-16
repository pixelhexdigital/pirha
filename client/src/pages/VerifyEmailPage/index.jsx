import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import Wordmark from "components/Wordmark";
import { useVerifyEmailMutation } from "api/authApi";
import { ROUTES } from "routes/RouterConfig";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifyEmail, { isLoading, isSuccess, isError, error }] =
    useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md duration-500 animate-in fade-in slide-in-from-bottom-2">
        <div className="mb-4 text-center">
          <Wordmark className="text-xl text-foreground" />
        </div>
        <div
          role="status"
          aria-live="polite"
          className="w-full p-6 text-center border shadow-sm bg-card rounded-xl sm:p-8"
        >
        {isLoading && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              Verifying your email…
            </h1>
          </>
        )}
        {isSuccess && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              Email verified
            </h1>
            <p className="mb-6 text-muted-foreground">
              Your email has been verified. You&apos;re all set.
            </p>
            <Button size="lg" onClick={() => navigate(ROUTES.AUTH)}>
              Go to sign in
            </Button>
          </>
        )}
        {isError && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              Verification failed
            </h1>
            <p className="mb-6 text-muted-foreground">
              {error?.data?.message ||
                "This verification link is invalid or has expired. Sign in and resend it from the banner."}
            </p>
            <Button size="lg" onClick={() => navigate(ROUTES.AUTH)}>
              Go to sign in
            </Button>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
