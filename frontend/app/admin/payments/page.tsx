"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FetchPaymentsResponse, Payment, PayoutStatus } from "@/lib/types"
import { getWithAuth, putWithAuth } from "@/service/httpService"
import { Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"

const page = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalPlatformFees, setTotalPlatformFees] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [processingPayout, setProcessingPayout] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response =
        await getWithAuth<FetchPaymentsResponse>("/admin/payments")
      const fetched = response.data.payments
      setPayments(fetched)
      setTotalRevenue(fetched.reduce((sum, p) => sum + p.totalAmount, 0))
      setTotalPlatformFees(fetched.reduce((sum, p) => sum + p.platformFees, 0))
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayout = async (
    appointmentId: string,
    payoutStatus: PayoutStatus | "Cancelled",
  ) => {
    setProcessingPayout(true)
    try {
      if (payoutStatus === "Cancelled") {
        setShowPayoutModal(false)
        setSelectedPayment(null)
        toast("Payout cancelled — no changes were made")
        return
      }

      await putWithAuth(`/admin/payments/${appointmentId}/payout`, {
        payoutStatus,
      })

      setPayments((prev) =>
        prev.map((p) =>
          p._id === appointmentId
            ? {
                ...p,
                payoutStatus,
                ...(payoutStatus === "Paid" && {
                  payoutDate: new Date().toISOString(),
                }),
              }
            : p,
        ),
      )

      setShowPayoutModal(false)
      setSelectedPayment(null)

      if (payoutStatus === "Paid") {
        toast.success("Payout processed successfully — teacher has been paid")
      } else if (payoutStatus === "Failed") {
        toast.error("Payout marked as failed — please retry or contact support")
      } else {
        toast(`Payout status updated to ${payoutStatus}`)
      }

      await fetchPayments()
    } catch (error) {
      console.error("Failed to process payout:", error)
      toast.error("Failed to process payout — please try again")
    } finally {
      setProcessingPayout(false)
    }
  }

  const handleCancelPayout = () => {
    if (!selectedPayment) return
    handleProcessPayout(selectedPayment._id, "Cancelled")
  }

  const openPayoutModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowPayoutModal(true)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  const getPayoutBadge = (status: PayoutStatus) => {
    switch (status) {
      case "Paid":
        return "border-emerald-200 text-emerald-700 bg-emerald-50"
      case "Failed":
        return "border-red-200 text-red-600 bg-red-50"
      case "Pending":
        return "border-amber-200 text-amber-700 bg-amber-50"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {payments.length} completed appointment
              {payments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPlatformFees)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total platform earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total completed appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Payments table ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Payments</CardTitle>
        </CardHeader>

        <CardContent>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <p className="text-sm">No completed payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {[
                      "Date",
                      "Teacher",
                      "Student",
                      "Appointment Fees",
                      "Platform Fees",
                      "Total",
                      "Payout Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(payment.date)}
                      </td>

                      {/* Teacher */}
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {payment.teacher.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.teacher.email}
                        </div>
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {payment.student.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.student.email}
                        </div>
                      </td>

                      {/* Appointment Fees */}
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(payment.appointmentFees)}
                      </td>

                      {/* Platform Fees */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatCurrency(payment.platformFees)}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(payment.totalAmount)}
                      </td>

                      {/* Payout Status */}
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={getPayoutBadge(payment.payoutStatus)}
                        >
                          {payment.payoutStatus}
                        </Badge>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={payment.payoutStatus === "Paid"}
                          onClick={() => openPayoutModal(payment)}
                          className="text-xs h-7"
                        >
                          {payment.payoutStatus === "Paid" ? "Paid" : "Pay Now"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Payout modal ──────────────────────────────────────────────────── */}
      <Dialog
        open={showPayoutModal}
        onOpenChange={(open: any) => {
          if (!open) {
            setShowPayoutModal(false)
            setSelectedPayment(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Review the payout details before confirming.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teacher</span>
                  <span className="font-medium">
                    {selectedPayment.teacher.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-medium">
                    {selectedPayment.student.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Date</span>
                  <span className="font-medium">
                    {formatDate(selectedPayment.slotStartIso)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium">{selectedPayment.subject}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-muted-foreground">Platform Fees</span>
                  <span className="font-medium text-muted-foreground">
                    - {formatCurrency(selectedPayment.platformFees)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Teacher Payout</span>
                  <span className="text-emerald-600">
                    {formatCurrency(selectedPayment.appointmentFees)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelPayout}
              disabled={processingPayout}
            >
              Cancel
            </Button>

            <Button
              onClick={() =>
                selectedPayment &&
                handleProcessPayout(selectedPayment._id, "Paid")
              }
              disabled={processingPayout}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processingPayout ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing…
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default page
