import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import LayoutClient from "@/components/admin/layout-client";
import { getCurrentAdminPermissions } from "@/actions/admin/admin-actions";
import { getAdminNavData } from "@/actions/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin-permissions"],
      queryFn: getCurrentAdminPermissions,
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin-nav"],
      queryFn: getAdminNavData,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LayoutClient>{children}</LayoutClient>
    </HydrationBoundary>
  );
}