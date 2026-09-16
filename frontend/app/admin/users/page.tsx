"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User as UserType } from "@/lib/types"
import { getWithAuth, putWithAuth } from "@/service/httpService"
import {
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"
import React, { useCallback, useEffect, useMemo, useState } from "react"

type FilterType = "all" | "student" | "teacher"
type StatusFilter = "all" | "active" | "inactive" | "verified" | "unverified"

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}
interface UserSummary {
  students: number
  teachers: number
}
interface FetchUsersResponse {
  users: UserType[]
  pagination: Pagination
  summary: UserSummary
}
interface UpdateStatusPayload {
  type: "student" | "teacher"
  isActive?: boolean
  isVerified?: boolean
}

// Stores the action that needs confirmation before executing
interface PendingAction {
  userId: string
  payload: UpdateStatusPayload
  userName: string
}

type UserWithMeta = UserType & {
  createdAt?: string
  userType?: "student" | "teacher"
}

const TYPE_FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Students", value: "student" },
  { label: "Teachers", value: "teacher" },
]
const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
]

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const formatDate = (dateStr?: string) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—"

const UsersPage = () => {
  const [users, setUsers] = useState<UserWithMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [summary, setSummary] = useState<UserSummary>({
    students: 0,
    teachers: 0,
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(
    async (page: number = pagination.page) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          type: filterType,
          search: searchTerm.trim(),
          page: String(page),
          limit: String(pagination.limit),
          sortBy: "createdAt",
          sortOrder: "desc",
        })
        const res = await getWithAuth<FetchUsersResponse>(
          `/admin/users?${params.toString()}`,
        )
        setUsers(res.data.users as UserWithMeta[])
        setPagination(res.data.pagination)
        setSummary(res.data.summary)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    },
    [filterType, searchTerm, pagination.page, pagination.limit],
  )

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }))
    fetchUsers(1)
  }, [filterType])
  useEffect(() => {
    const t = setTimeout(() => {
      setPagination((p) => ({ ...p, page: 1 }))
      fetchUsers(1)
    }, 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handlePageChange = (page: number) => {
    setPagination((p) => ({ ...p, page }))
    fetchUsers(page)
  }

  const handleToggleUserStatus = async (
    userId: string,
    payload: UpdateStatusPayload,
  ) => {
    setUpdatingId(userId)
    try {
      await putWithAuth(`/admin/users/${userId}/status`, payload)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                ...(payload.isActive !== undefined && {
                  isActive: payload.isActive,
                }),
                ...(payload.isVerified !== undefined && {
                  isVerified: payload.isVerified,
                }),
              }
            : u,
        ),
      )
    } catch (error) {
      console.error("Failed to update user status:", error)
    } finally {
      setUpdatingId(null)
      setPendingAction(null) // always close dialog after attempt
    }
  }

  /**
   * Deactivating is destructive — route through confirmation dialog.
   * Activating / verify / unverify are safe — call directly.
   */
  const getUserType = (user: UserWithMeta) =>
    (user.userType ?? user.type) as "student" | "teacher"

  const handleActiveClick = (user: UserWithMeta) => {
    if (user.isActive) {
      setPendingAction({
        userId: user.id,
        userName: user.name,
        payload: { type: getUserType(user), isActive: false },
      })
    } else {
      handleToggleUserStatus(user.id, {
        type: getUserType(user),
        isActive: true,
      })
    }
  }

  const handleVerifyClick = (user: UserWithMeta) =>
    handleToggleUserStatus(user.id, {
      type: getUserType(user),
      isVerified: !user.isVerified,
    })

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") return users
    return users.filter((u) => {
      switch (statusFilter) {
        case "active":
          return u.isActive === true
        case "inactive":
          return u.isActive === false
        case "verified":
          return u.isVerified === true
        case "unverified":
          return u.isVerified === false
        default:
          return true
      }
    })
  }, [users, statusFilter])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6">
      {/* ── Deactivation confirmation dialog ────────────────────────────── */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate {pendingAction?.userName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately block{" "}
              <strong>{pendingAction?.userName}</strong> from logging in. Their
              data is preserved and you can reactivate the account at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={() =>
                pendingAction &&
                handleToggleUserStatus(
                  pendingAction.userId,
                  pendingAction.payload,
                )
              }
            >
              Deactivate account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Filter card ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filter Users</CardTitle>
          <CardDescription>
            Search and filter by type or account status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-1.5">
              {TYPE_FILTERS.map(({ label, value }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filterType === value ? "default" : "outline"}
                  onClick={() => setFilterType(value)}
                >
                  {label}
                  {value !== "all" && (
                    <span className="ml-1.5 text-[11px] opacity-70">
                      {value === "student"
                        ? summary.students
                        : summary.teachers}
                    </span>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex gap-1.5 border-l pl-4">
              {STATUS_FILTERS.map(({ label, value }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={statusFilter === value ? "secondary" : "ghost"}
                  onClick={() => setStatusFilter(value)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Users table ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" /> Users
              </CardTitle>
              <CardDescription>
                Manage accounts and their status
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {pagination.total} total
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <Users className="h-9 w-9 opacity-30" />
              <p className="text-sm">No users match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {[
                      "Name",
                      "Email",
                      "Type",
                      "Status",
                      "Verified",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => {
                    const busy = updatingId === user.id
                    const isAdmin = user.type === "admin"
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <span className="font-medium truncate max-w-[120px]">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[160px]">
                          {user.email}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              getUserType(user) === "teacher"
                                ? "border-violet-200 text-violet-700 bg-violet-50"
                                : getUserType(user) === "student"
                                  ? "border-sky-200 text-sky-700 bg-sky-50"
                                  : "border-amber-200 text-amber-700 bg-amber-50"
                            }
                          >
                            {getUserType(user) === "teacher" && (
                              <GraduationCap className="h-3 w-3 mr-1" />
                            )}
                            <span className="capitalize">
                              {getUserType(user)}
                            </span>
                          </Badge>
                        </td>

                        {/* Active status */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              user.isActive
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                : "border-red-200 text-red-600 bg-red-50"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {/* Verified */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              user.isVerified
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : "border-zinc-200 text-zinc-500 bg-zinc-50"
                            }
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy || isAdmin}
                              onClick={() => handleActiveClick(user)}
                              className={`text-xs h-7 px-2 ${
                                user.isActive
                                  ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                                  : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {busy ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : user.isActive ? (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy || isAdmin}
                              onClick={() => handleVerifyClick(user)}
                              className={`text-xs h-7 px-2 ${
                                user.isVerified
                                  ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                  : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              }`}
                            >
                              {user.isVerified ? (
                                <>
                                  <ShieldX className="h-3 w-3 mr-1" />
                                  Unverify
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Verify
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {filteredUsers.length} of {pagination.total} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground px-1">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersPage
