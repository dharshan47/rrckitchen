import Link from "next/link";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";

interface FeaturedMenuProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    timeSlot: string;
    foodType: string;
    kitchenName: string;
  }>;
}

export default function FeaturedMenu({ items }: FeaturedMenuProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden border border-border bg-white">
          <CardHeader className="px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.kitchenName}</p>
              </div>
              <Badge variant="outline">{item.foodType}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <p className="text-sm leading-6 text-muted-foreground">Available for tomorrow delivery.</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-lg font-semibold text-foreground">₹{item.price}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.timeSlot}</p>
            </div>
            <Button asChild size="sm">
              <Link href="/menu">Explore</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}
