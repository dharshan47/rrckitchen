"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useKitchenData } from "../layout"
import { updateKitchenBankDetails } from "@/actions/admin/dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function PaymentsPage() {
  const queryClient = useQueryClient()
  const data = useKitchenData()
  const s = data.stats
  const kyc = data.kitchen

  const bankSchema = z.object({
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    upiId: z.string().optional(),
    gpayNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  type BankFormData = z.infer<typeof bankSchema>

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankName: kyc.bankName ?? "",
      accountHolderName: kyc.accountHolderName ?? "",
      bankAccountNumber: kyc.bankAccountNumber ?? "",
      ifscCode: kyc.ifscCode ?? "",
      upiId: kyc.upiId ?? "",
      gpayNumber: kyc.gpayNumber ?? "",
      phoneNumber: kyc.phoneNumber ?? "",
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: BankFormData) => updateKitchenBankDetails(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      }
    },
  })

  const handleSave = (data: BankFormData) => {
    saveMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{s.monthRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Commission</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">₹{Math.round(s.monthRevenue * 0.1).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">Platform fee (10%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net Amount</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">₹{Math.round(s.monthRevenue * 0.9).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">After commission</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bank & Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" {...form.register("bankName")} placeholder="Enter bank name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input id="accountHolderName" {...form.register("accountHolderName")} placeholder="Enter account holder name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                <Input id="bankAccountNumber" {...form.register("bankAccountNumber")} placeholder="Enter account number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" {...form.register("ifscCode")} placeholder="Enter IFSC code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input id="upiId" {...form.register("upiId")} placeholder="e.g. name@upi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpayNumber">GPay / PhonePe Number</Label>
                <Input id="gpayNumber" {...form.register("gpayNumber")} placeholder="Enter GPay/PhonePe number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="Enter phone number" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Payment Details"}
              </Button>
              {saveMutation.isSuccess && <span className="text-sm text-green-600">Saved successfully!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader><CardTitle>Settlement History</CardTitle></CardHeader>
        <CardContent>
          {data.settlements.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No settlements yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.settlements.map((s) => (
                  <TableRow key={s.period}>
                    <TableCell>{s.period}</TableCell>
                    <TableCell>₹{s.gross.toLocaleString()}</TableCell>
                    <TableCell>₹{s.commission.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{s.net.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>{s.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
