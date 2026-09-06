import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { fetchAdminRolesApi, fetchAdminUsersWithFiltersApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { AdminRole, AdminUser } from "../types/domain";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function UserListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [roleFilter, setRoleFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        setRoles(await fetchAdminRolesApi());
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load roles."));
      }
    }

    void loadRoles();
  }, []);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const nextUsers = await fetchAdminUsersWithFiltersApi({
          search: searchTerm,
          status: statusFilter,
          roleCode: roleFilter
        });
        setUsers(nextUsers);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load users."));
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [searchTerm, statusFilter, roleFilter]);

  const filteredUsers = useMemo(() => users, [users]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Users"
        subtitle="Manage operations access, assigned roles, and account status."
        actions={(
          <Link className="button-link" to="/users/new">
            <PersonAddAltRoundedIcon fontSize="small" />
            Create user
          </Link>
        )}
      />

      <div className="filter-grid">
        <label>
          Search Users
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by username, name, email, or phone"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | "ACTIVE" | "INACTIVE")}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label>
          Role
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.code}>{role.code}</option>
            ))}
          </select>
        </label>
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading users..." /> : null}

      {!loading ? (
        <DataTable recordCount={filteredUsers.length} isEmpty={filteredUsers.length === 0} emptyText="No users found.">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link className="record-id-link" to={`/users/${user.id}/edit`}>
                    {user.id}
                  </Link>
                </td>
                <td>{user.username}</td>
                <td>{`${user.firstName} ${user.lastName}`.trim() || "-"}</td>
                <td>{user.email ?? "-"}</td>
                <td>{user.roleCode}</td>
                <td>
                  <StatusBadge
                    label={formatEnumLabel(user.status)}
                    tone={user.active ? "success" : "warning"}
                  />
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td className="actions-cell">
                  <Link className="button-link button-link-secondary button-small" to={`/users/${user.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}
