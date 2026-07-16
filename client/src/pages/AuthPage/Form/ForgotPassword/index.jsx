import Icon from "components/Icon";
import ForgotPasswordForm from "./ForgotPasswordForm";

const ForgotPasswordPage = ({ onClick }) => {
  return (
    <>
      <button
        className="flex items-center mb-8 text-lg text-foreground group sm:h5 h6"
        onClick={onClick}
      >
        <Icon
          className="mr-3 transition-transform sm:mr-4 fill-foreground group-hover:-translate-x-1"
          name="arrow-prev"
        />
        Reset your password
      </button>

      <ForgotPasswordForm onSuccess={onClick} />
    </>
  );
};

export default ForgotPasswordPage;
