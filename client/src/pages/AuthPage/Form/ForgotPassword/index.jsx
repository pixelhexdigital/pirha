import Icon from "components/Icon";
import ForgotPasswordForm from "./ForgotPasswordForm";

const ForgotPasswordPage = ({ onClick }) => {
  return (
    <>
      <button
        className="flex items-center mb-8 text-lg dark:text-white text-n-5 group sm:h5 h6"
        onClick={onClick}
      >
        <Icon
          className="mr-3 transition-transform sm:mr-4 group-hover:-translate-x-1 dark:fill-n-1 file:n-5"
          name="arrow-prev"
        />
        Reset your password
      </button>

      <ForgotPasswordForm onSuccess={onClick} />
    </>
  );
};
``;
export default ForgotPasswordPage;
