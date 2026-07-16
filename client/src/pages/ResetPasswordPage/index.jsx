import { useParams, useNavigate } from "react-router-dom";

import { ROUTES } from "routes/RouterConfig";
import Wordmark from "components/Wordmark";
import ResetPasswordForm from "pages/AuthPage/Form/ForgotPassword/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md duration-500 animate-in fade-in slide-in-from-bottom-2">
        <div className="mb-4 text-center">
          <Wordmark className="text-xl text-foreground" />
        </div>
        <div className="p-6 border shadow-sm bg-card rounded-xl sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>
          <ResetPasswordForm
            resetToken={resetToken}
            onClick={() => navigate(ROUTES.AUTH)}
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
