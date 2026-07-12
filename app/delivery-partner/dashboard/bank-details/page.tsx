"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDeliveryData } from "../layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateDeliveryPartnerBankDetails } from "@/actions/admin/dashboard"

export default function BankDetailsPage() {
  const queryClient = useQueryClient()
  const data = useDeliveryData()
  const profile = data.profile

  const bankDetailsSchema = z.object({
    bankName: z.string(),
    bankAccountNumber: z.string(),
    ifscCode: z.string(),
    accountHolderName: z.string(),
    upiId: z.string(),
    googlePayNumber: z.string(),
    phonePeNumber: z.string(),
  })
  type BankDetailsFormData = z.infer<typeof bankDetailsSchema>

  const form = useForm<BankDetailsFormData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: profile.bankName ?? "",
      bankAccountNumber: profile.bankAccount ?? "",
      ifscCode: profile.bankIfsc ?? "",
      accountHolderName: profile.accountHolderName ?? "",
      upiId: profile.upi ?? "",
      googlePayNumber: profile.googlePayNumber ?? "",
      phonePeNumber: profile.phonePeNumber ?? "",
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: BankDetailsFormData) =>
      updateDeliveryPartnerBankDetails(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Bank details updated successfully")
        queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const handleSave = (data: BankDetailsFormData) => {
    saveMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bank & UPI Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Bank Account
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...form.register("bankName")}
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    {...form.register("accountHolderName")}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    {...form.register("bankAccountNumber")}
                    placeholder="Enter bank account number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    {...form.register("ifscCode")}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                UPI & Payment Apps
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    {...form.register("upiId")}
                    placeholder="e.g. name@upi"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="googlePayNumber">Google Pay Number</Label>
                  <Input
                    id="googlePayNumber"
                    {...form.register("googlePayNumber")}
                    placeholder="Phone number for GPay"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phonePeNumber">PhonePe Number</Label>
                  <Input
                    id="phonePeNumber"
                    {...form.register("phonePeNumber")}
                    placeholder="Phone number for PhonePe"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saveMutation.isPending} className="w-full sm:w-auto">
              {saveMutation.isPending ? "Saving..." : "Save Bank Details"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
