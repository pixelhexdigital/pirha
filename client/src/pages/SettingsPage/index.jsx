import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import { Separator } from "components/ui/separator";
import ChangePasswordForm from "pages/SettingsPage/ChangePasswordForm";
import UserProfileForm from "pages/SettingsPage/UserProfileForm";

const SettingPage = () => {
  return (
    <Layout>
      <PageHeader
        title="Settings"
        description="Manage your account settings, including profile information and password changes."
      />
      <div className="flex flex-col gap-6 pb-6">
        <UserProfileForm />
        <Separator />
        <ChangePasswordForm />
      </div>
    </Layout>
  );
};

export default SettingPage;
