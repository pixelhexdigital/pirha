import { useParams, useNavigate } from "react-router-dom";

import { ROUTES } from "routes/RouterConfig";
import ResetPasswordForm from "pages/AuthPage/Form/ForgotPassword/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full mx-auto p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Reset Password
        </h2>
        <ResetPasswordForm
          resetToken={resetToken}
          onClick={() => navigate(ROUTES.AUTH)}
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
