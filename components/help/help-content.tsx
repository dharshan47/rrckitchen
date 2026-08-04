"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface HelpTab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

export function HelpContent({ tabs }: { tabs: HelpTab[] }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-muted-foreground -ml-2 mb-4 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Help &amp; Support</h1>
            <p className="text-sm text-muted-foreground">Let&apos;s take a step ahead and help you better.</p>
          </div>
        </div>

        <Tabs defaultValue="orders" orientation="vertical" className="hidden md:flex gap-6">
          <TabsList variant="line" className="w-64 shrink-0 h-fit bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="justify-start gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium">
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex-1 min-w-0">
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="rounded-xl border border-border p-4 md:p-6 mt-0">
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <Tabs defaultValue="orders" className="md:hidden">
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start gap-1 bg-transparent p-0 pb-3 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="shrink-0 gap-1.5 px-3 py-2 rounded-lg text-xs font-medium">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="rounded-xl border border-border p-4 mt-0">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
