import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        {isLoading && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">
              Verifying your email...
            </h2>
          </>
        )}
        {isSuccess && (
          <>
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Email Verified
            </h2>
            <p className="text-muted-foreground mb-6">
              Your email has been successfully verified. You can now log in.
            </p>
            <Button onClick={() => navigate(ROUTES.AUTH)}>Go to Login</Button>
          </>
        )}
        {isError && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Verification Failed
            </h2>
            <p className="text-muted-foreground mb-6">
              {error?.data?.message ||
                "The verification link is invalid or has expired."}
            </p>
            <Button variant="outline" onClick={() => navigate(ROUTES.AUTH)}>
              Back to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
