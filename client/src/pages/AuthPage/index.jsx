import { Link } from "react-router-dom";

import Form from "./Form";
import Icon from "components/Icon";
import { ROUTES } from "routes/RouterConfig";

const AuthPage = () => {
  // const isAuthenticated = useSelector(selectIsLoggedIn);
  const isAuthenticated = false;

  return (
    <div className="relative flex w-full min-h-screen gap-2 p-2 min-h-screen-ios sm:p-6">
      <div className="flex grow justify-start  sm:my-6 mx-auto rounded-[1.25rem] p-4">
        <Form />
      </div>
    </div>
  );
};

export default AuthPage;
