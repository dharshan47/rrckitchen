"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDeliveryData } from "../layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateProfileNameEmail } from "@/actions/onboarding/profile"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const data = useDeliveryData()
  const profile = data.profile
  const [editing, setEditing] = useState(false)
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, email: profile.email ?? "" },
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      updateProfileNameEmail(data),
    onSuccess: (result) => {
      if (result.success) {
        setEditing(false)
        toast.success("Profile updated")
        queryClient.invalidateQueries({ queryKey: ["delivery-dashboard"] })
      } else {
        toast.error(result.error ?? "Failed to update profile")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => {
              form.reset({ name: profile.name, email: profile.email ?? "" })
              setEditing(true)
            }}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="dp-name">Name</Label>
                <Input id="dp-name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dp-email">Email</Label>
                <Input id="dp-email" type="email" {...form.register("email")} />
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
                    form.reset({ name: profile.name, email: profile.email ?? "" })
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
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email ?? "Not set"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
