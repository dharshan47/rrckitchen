import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomeClient } from "@/components/home/home-client";
import { getKitchenData, getRecentOrderKitchens } from "@/actions/catalog/home-data";
import { getTomorrowMenu } from "@/actions/catalog/menu";
import { getSession } from "@/lib/auth-server";

export default async function HomePage() {
  const queryClient = new QueryClient();

  const [session, kitchenData] = await Promise.all([
    getSession(),
    getKitchenData(),
  ]);

  const [recentOrderKitchens] = await Promise.all([
    getRecentOrderKitchens(session?.user?.id),
    queryClient.prefetchQuery({
      queryKey: ["tomorrow-menu", { q: "", foodType: "ALL", timeSlot: "ALL" }],
      queryFn: () => getTomorrowMenu({ foodType: "ALL", timeSlot: "ALL" }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient
        topRatedKitchens={kitchenData.topRatedKitchens}
        newKitchens={kitchenData.newKitchens}
        recentOrderKitchens={recentOrderKitchens}
        initialMenuItems={undefined}
      />
    </HydrationBoundary>
  );
}
