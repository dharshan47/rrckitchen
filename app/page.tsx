import { HomeClient } from "@/components/home/home-client";
import { getHomePageData } from "@/actions/catalog/home-data";
import { getSession } from "@/lib/auth-server";

export default async function HomePage() {
  const session = await getSession();
  const userId = session?.user?.id;

  const homeData = await getHomePageData(userId);

  return (
    <HomeClient
      topRatedKitchens={homeData.topRatedKitchens}
      newKitchens={homeData.newKitchens}
      recentOrderKitchens={homeData.recentOrderKitchens}
    />
  );
}
