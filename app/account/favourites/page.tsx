import { Metadata } from "next";
import { FavouritesContent } from "@/components/account/favourites-content";

export const metadata: Metadata = {
  title: "My Favourites",
  description: "Your saved kitchens and menu items",
};

export default function FavouritesPage() {
  return <FavouritesContent />;
}
