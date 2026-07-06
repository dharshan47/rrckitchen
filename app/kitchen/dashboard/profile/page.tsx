"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useKitchenData } from "../layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateKitchenBankDetails } from "@/actions/dashboard"

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const data = useKitchenData()
  const kitchen = data.kitchen
  const [editingBank, setEditingBank] = useState(false)

  const [bankName, setBankName] = useState(kitchen.bankName ?? "")
  const [bankAccountNumber, setBankAccountNumber] = useState(kitchen.bankAccountNumber ?? "")
  const [ifscCode, setIfscCode] = useState(kitchen.ifscCode ?? "")
  const [accountHolderName, setAccountHolderName] = useState(kitchen.accountHolderName ?? "")
  const [upiId, setUpiId] = useState(kitchen.upiId ?? "")
  const [gpayNumber, setGpayNumber] = useState(kitchen.gpayNumber ?? "")
  const [phoneNumber, setPhoneNumber] = useState(kitchen.phoneNumber ?? "")
  const bankMutation = useMutation({
    mutationFn: () =>
      updateKitchenBankDetails({
        bankName,
        bankAccountNumber,
        ifscCode,
        accountHolderName,
        upiId,
        gpayNumber,
        phoneNumber,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Bank details updated successfully")
        setEditingBank(false)
        queryClient.invalidateQueries({ queryKey: ["kitchen-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    bankMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kitchen Name</Label>
              <p className="font-medium">{kitchen.displayName}</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Badge variant="secondary" className="bg-green-100 text-green-700 font-medium">
                {kitchen.status}
              </Badge>
            </div>

          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bank & UPI Details</CardTitle>
          {!editingBank && (
            <Button variant="outline" size="sm" onClick={() => setEditingBank(true)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingBank ? (
            <form onSubmit={handleSaveBank} className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Bank Account
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="kh-bankName">Bank Name</Label>
                    <Input
                      id="kh-bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-accountHolderName">Account Holder Name</Label>
                    <Input
                      id="kh-accountHolderName"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-bankAccountNumber">Bank Account Number</Label>
                    <Input
                      id="kh-bankAccountNumber"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Enter bank account number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-ifscCode">IFSC Code</Label>
                    <Input
                      id="kh-ifscCode"
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
                    <Label htmlFor="kh-upiId">UPI ID</Label>
                    <Input
                      id="kh-upiId"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. name@upi"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-gpayNumber">Google Pay Number</Label>
                    <Input
                      id="kh-gpayNumber"
                      value={gpayNumber}
                      onChange={(e) => setGpayNumber(e.target.value)}
                      placeholder="Phone number for GPay"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kh-phoneNumber">PhonePe / Other UPI Number</Label>
                    <Input
                      id="kh-phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number for PhonePe"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={bankMutation.isPending}>
                  {bankMutation.isPending ? "Saving..." : "Save Bank Details"}
                </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingBank(false)
                      setBankName(kitchen.bankName ?? "")
                      setBankAccountNumber(kitchen.bankAccountNumber ?? "")
                      setIfscCode(kitchen.ifscCode ?? "")
                      setAccountHolderName(kitchen.accountHolderName ?? "")
                      setUpiId(kitchen.upiId ?? "")
                      setGpayNumber(kitchen.gpayNumber ?? "")
                      setPhoneNumber(kitchen.phoneNumber ?? "")
                    }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Bank Account
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{kitchen.bankName ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Holder</p>
                    <p className="font-medium">{kitchen.accountHolderName ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium">{kitchen.bankAccountNumber ? kitchen.bankAccountNumber.replace(/\d(?=\d{4})/g, "*") : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">IFSC Code</p>
                    <p className="font-medium">{kitchen.ifscCode ?? "Not set"}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  UPI & Payment Apps
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">UPI ID</p>
                    <p className="font-medium">{kitchen.upiId ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Google Pay</p>
                    <p className="font-medium">{kitchen.gpayNumber ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PhonePe</p>
                    <p className="font-medium">{kitchen.phoneNumber ?? "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
