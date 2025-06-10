import Layout from "components/Layout";
import ChangePasswordForm from "pages/SettingsPage/ChangePasswordForm";
import UserProfileForm from "pages/SettingsPage/UserProfileForm";

const SettingPage = () => {
  return (
    <Layout>
      <div className="flex sm:items-center justify-between p-4 border-b sm:flex-row flex-col gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings, including profile information and
            password changes.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 pb-4">
        <UserProfileForm />
        <ChangePasswordForm />
      </div>
    </Layout>
  );
};

export default SettingPage;
