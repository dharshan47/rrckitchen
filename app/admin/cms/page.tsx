"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ToggleLeft, ToggleRight, Plus } from "lucide-react"
import { toast } from "sonner"
import { getAllCategories, addCategory, toggleCategory } from "@/actions/admin/admin-cms"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
})

type CategoryForm = z.infer<typeof categorySchema>

export default function AdminCMSPage() {
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  })

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAllCategories,
  })

  const addMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Category added")
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
        reset()
      } else {
        toast.error(result.error ?? "Failed to add category")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCategory(id, isActive),
    onSuccess: () => {
      toast.success("Category updated")
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
    onError: () => toast.error("Something went wrong"),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <Skeleton className="h-6 w-44 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="rounded-xl border border-border bg-card">
          <div className="p-6 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="px-6 pb-6 space-y-3">
            <div className="flex gap-6 pb-3 border-b border-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3 max-w-md">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = (formData: CategoryForm) => {
    addMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Content Management</h1>
        <p className="text-sm text-muted-foreground">Manage food categories used across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Categories</CardTitle>
          <p className="text-sm text-muted-foreground">
            Categories like cuisine types (South Indian, Chinese, Biryani, etc.) that kitchens can be tagged with
          </p>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No categories yet. Add one below.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Kitchens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cat.description ?? "—"}</TableCell>
                    <TableCell>{cat.kitchenCount}</TableCell>
                    <TableCell>
                      <Badge variant={cat.isActive ? "default" : "secondary"}>
                        {cat.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: cat.id, isActive: !cat.isActive })}
                        disabled={toggleMutation.isPending}
                      >
                        {cat.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-md">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" placeholder="e.g. South Indian" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional description" {...register("description")} />
            </div>
            <Button type="submit" className="w-fit" disabled={addMutation.isPending}>
              <Plus className="h-4 w-4 mr-1.5" />
              {addMutation.isPending ? "Adding..." : "Add Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
