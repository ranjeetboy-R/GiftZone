'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Users,
  RefreshCw,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { apiFetch } from '@/lib/api';

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async (
    currentPage = page,
    searchQuery = query,
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const params = new URLSearchParams();

      params.set('page', String(currentPage));
      params.set('limit', String(PAGE_SIZE));

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const data = await apiFetch(
        `/api/users/get-allUsers?${params.toString()}`
      );

      const loadedUsers = Array.isArray(data?.users)
        ? data.users
        : [];

      const pagination = data?.pagination || {};

      setUsers(loadedUsers);
      setTotalUsers(Number(pagination.total) || 0);
      setPages(Math.max(Number(pagination.pages) || 1, 1));
      setPage(Number(pagination.page) || currentPage);
    } catch (error) {
      console.error('Failed to load users:', error);

      setError(
        error.message ||
        'Failed to load users.'
      );

      toast.error(
        error.message ||
        'Failed to load users.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers(1, query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const changePage = nextPage => {
    if (
      nextPage < 1 ||
      nextPage > pages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
    loadUsers(nextPage, query);
  };

  const getUserName = user => {
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');

    return name || 'Unnamed User';
  };

  const formatDate = date => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  const deleteUser = async user => {
    const confirmed = window.confirm(
      `Delete "${getUserName(user)}"?\n\nThis will delete the user from Clerk and MongoDB.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(
        `/api/users/delete-user/${user.clerkId}`,
        {
          method: 'DELETE'
        }
      );

      setSelectedUser(null);

      const isLastUserOnPage =
        users.length === 1 && page > 1;

      if (isLastUserOnPage) {
        const nextPage = page - 1;

        setPage(nextPage);
        await loadUsers(nextPage, query);
      } else {
        await loadUsers(page, query);
      }

      toast.success('User deleted successfully.');
    } catch (error) {
      console.error('Failed to delete user:', error);

      toast.error(
        error.message ||
        'Failed to delete user.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customers, admins and account access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadUsers(page, query, true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'animate-spin' : ''}
          />

          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex w-full items-center gap-3 rounded-md border border-slate-300 px-3">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search name, email, phone or user ID..."
            className="w-full py-3 text-sm outline-none"
          />
        </div>

        <div className="mt-3 text-sm text-slate-500">
          Showing{' '}
          <span className="font-medium text-slate-700">
            {users.length}
          </span>{' '}
          of{' '}
          <span className="font-medium text-slate-700">
            {totalUsers}
          </span>{' '}
          users
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Joined
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td
                      colSpan={5}
                      className="px-5 py-5"
                    >
                      <div className="h-10 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : users.length ? (
                users.map(user => {
                  const name = getUserName(user);

                  return (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={name || 'Profile pic'}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {name}
                            </p>

                            <p className="mt-0.5 max-w-55 truncate text-xs text-slate-500">
                              {user.clerkId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {user.phone || ''}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            user.isActive === false
                              ? 'inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700'
                              : 'inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700'
                          }
                        >
                          {user.isActive === false
                            ? 'Inactive'
                            : 'Active'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="View user"
                            onClick={() => setSelectedUser(user)}
                            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete user"
                            onClick={() => deleteUser(user)}
                            disabled={actionLoading}
                            className="rounded-md p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center"
                  >
                    <Users
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalUsers > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {pages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <div className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              {page}
            </div>

            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page === pages}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User details modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  User Details
                </h2>

                <p className="text-sm text-slate-500">
                  Account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                {selectedUser.imageUrl ? (
                  <img
                    src={selectedUser.imageUrl}
                    alt={getUserName(selectedUser)}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-600">
                    {getUserName(selectedUser)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {getUserName(selectedUser)}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-800">
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedUser.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedUser.isActive === false
                      ? 'Inactive'
                      : 'Active'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Role
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                    {selectedUser.role || 'customer'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">
                    Clerk ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {selectedUser.clerkId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Joined
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(selectedUser.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}