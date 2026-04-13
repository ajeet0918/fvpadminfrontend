import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { UserForm, type UserFormValues } from "../components/UserForm";
import {
  deleteAdminUserApi,
  fetchAdminRolesApi,
  fetchAdminUserApi,
  readErrorMessage,
  resetAdminUserPasswordApi,
  updateAdminUserApi
} from "../lib/api";
import type { AdminRole } from "../types/domain";

const emptyValues: UserFormValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  roleCode: "",
  active: true,
  password: ""
};

export function UserEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [values, setValues] = useState<UserFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidId = useMemo(() => Number.isFinite(userId), [userId]);

  useEffect(() => {
    async function loadData() {
      if (!isValidId) {
        setErrorMessage("Invalid user id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [user, roleList] = await Promise.all([
          fetchAdminUserApi(userId),
          fetchAdminRolesApi()
        ]);
        setRoles(roleList);
        setValues({
          username: user.username,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          roleCode: user.roleCode,
          active: user.active,
          password: ""
        });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load user."));
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [isValidId, userId]);

  async function handleSubmit(nextValues: UserFormValues) {
    await updateAdminUserApi(userId, {
      firstName: nextValues.firstName.trim(),
      lastName: nextValues.lastName.trim(),
      email: nextValues.email.trim().toLowerCase(),
      phone: nextValues.phone.trim(),
      roleCode: nextValues.roleCode,
      active: nextValues.active
    });
    setSuccessMessage("User updated successfully.");
    setValues((current) => ({ ...current, ...nextValues }));
  }

  async function handleResetPassword(password: string) {
    await resetAdminUserPasswordApi(userId, { newPassword: password });
    setSuccessMessage("Password reset successfully.");
  }

  async function handleDeactivateOrDelete() {
    if (values.active) {
      const confirmedDeactivate = window.confirm("Deactivate this user?");
      if (!confirmedDeactivate) return;
      await updateAdminUserApi(userId, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        roleCode: values.roleCode,
        active: false
      });
      setValues((current) => ({ ...current, active: false }));
      setSuccessMessage("User deactivated.");
      return;
    }

    const confirmedDelete = window.confirm("User is inactive. Delete permanently?");
    if (!confirmedDelete) return;
    await deleteAdminUserApi(userId);
    navigate("/users");
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="User Edit"
        subtitle="Edit profile details, role, status, and reset password safely."
      />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      <UserForm
        title="Edit User"
        roles={roles}
        initialValues={values}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/users")}
        submitLabel="Save Changes"
        showPassword={false}
        showResetPassword
        onResetPassword={handleResetPassword}
        onDeactivateOrDelete={handleDeactivateOrDelete}
        deactivateLabel={values.active ? "Deactivate" : "Delete"}
      />
    </section>
  );
}
