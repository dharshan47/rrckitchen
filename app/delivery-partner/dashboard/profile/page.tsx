"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData } from "../layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const data = useDeliveryData()
  const profile = data.profile
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)

  const saveMutation = useMutation({
    mutationFn: async () => {
      // TODO: implement profile update server action
      await new Promise((r) => setTimeout(r, 500))
      return { success: true }
    },
    onSuccess: () => {
      setEditing(false)
      toast.success("Profile updated")
      queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false)
                    setName(profile.name)
                    setPhone(profile.phone)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
