import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Admin</Badge>
              <span className="text-sm text-muted-foreground">Overview, approvals, reports, and payouts.</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Manage Kitchen Partners, Suppliers, orders, refunds, and Thanjavur service zones from one panel.
            </p>
          </div>
          <Card className="rounded-[2rem] border border-border bg-slate-50 p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle>Admin actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-0">
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">Approvals</p>
                <p className="mt-2 text-sm text-muted-foreground">Approve or reject Kitchen Partners and Suppliers.</p>
              </div>
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">Reports</p>
                <p className="mt-2 text-sm text-muted-foreground">Export order and payout summaries for the platform.</p>
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-4">
              <Button asChild className="w-full">
                <Link href="/login">Open admin tools</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}
