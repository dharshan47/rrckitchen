import Link from "next/link";

import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";

export default function KitchenPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Kitchen Partner</Badge>
              <span className="text-sm text-muted-foreground">Manage tomorrow’s availability, menus, and orders.</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Kitchen Partner Portal</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Self-register, upload your menu, set tomorrow availability, and see confirmed orders in one place.
            </p>
          </div>
          <Card className="rounded-[2rem] border border-border bg-slate-50 p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle>Kitchen actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-0">
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">Availability toggle</p>
                <p className="mt-2 text-sm text-muted-foreground">Mark your next-day availability before the cutoff time.</p>
              </div>
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">Menu builder</p>
                <p className="mt-2 text-sm text-muted-foreground">Create Veg and Non-Veg slots for all four time windows.</p>
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-4">
              <Button asChild className="w-full">
                <Link href="/login">Register or manage kitchen</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
