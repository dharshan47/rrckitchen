"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData } from "../layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateDeliveryPartnerBankDetails } from "@/actions/dashboard"

export default function BankDetailsPage() {
  const queryClient = useQueryClient()
  const data = useDeliveryData()
  const profile = data.profile

  const [bankName, setBankName] = useState(profile.bankName ?? "")
  const [bankAccountNumber, setBankAccountNumber] = useState(profile.bankAccount ?? "")
  const [ifscCode, setIfscCode] = useState(profile.bankIfsc ?? "")
  const [accountHolderName, setAccountHolderName] = useState(profile.accountHolderName ?? "")
  const [upiId, setUpiId] = useState(profile.upi ?? "")
  const [googlePayNumber, setGooglePayNumber] = useState(profile.googlePayNumber ?? "")
  const [phonePeNumber, setPhonePeNumber] = useState(profile.phonePeNumber ?? "")

  const saveMutation = useMutation({
    mutationFn: () =>
      updateDeliveryPartnerBankDetails({
        bankName,
        bankAccountNumber,
        ifscCode,
        accountHolderName,
        upiId,
        googlePayNumber,
        phonePeNumber,
      }),
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bank & UPI Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Bank Account
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Enter bank account number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
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
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@upi"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="googlePayNumber">Google Pay Number</Label>
                  <Input
                    id="googlePayNumber"
                    value={googlePayNumber}
                    onChange={(e) => setGooglePayNumber(e.target.value)}
                    placeholder="Phone number for GPay"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phonePeNumber">PhonePe Number</Label>
                  <Input
                    id="phonePeNumber"
                    value={phonePeNumber}
                    onChange={(e) => setPhonePeNumber(e.target.value)}
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
