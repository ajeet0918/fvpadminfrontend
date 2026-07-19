import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { UserForm, type UserFormValues } from "../components/UserForm";
import { createAdminUserApi, fetchAdminRolesApi, readErrorMessage } from "../lib/api";
import type { AdminRole } from "../types/domain";

const initialValues: UserFormValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  roleCode: "",
  active: true,
  password: ""
};

export function UserCreatePage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoading(true);
        const result = await fetchAdminRolesApi();
        setRoles(result);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load roles."));
      } finally {
        setLoading(false);
      }
    }

    void loadRoles();
  }, []);

  async function handleSubmit(values: UserFormValues) {
    await createAdminUserApi({
      username: values.username.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      password: values.password,
      roleCode: values.roleCode,
      active: values.active
    });
    navigate("/users");
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Create user"
        subtitle="Add an operations user and assign the minimum role needed for their work."
        actions={<BackLink to="/users" label="Back to users" />}
      />
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Preparing user form..." /> : (
        <UserForm
          title="User account"
          description="Assign identity, contact details, role, and an initial password."
          roles={roles}
          initialValues={{ ...initialValues, roleCode: roles[0]?.code ?? "" }}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/users")}
          submitLabel="Create user"
          showPassword
        />
      )}
    </section>
  );
}
