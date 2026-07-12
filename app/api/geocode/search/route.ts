import { THANJAVUR_BOUNDS } from "@/lib/geo/thanjavur-bounds";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.length < 1) return Response.json([]);

  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", q);
  url.searchParams.set("apiKey", process.env.GEOAPIFY_API_KEY!);
  url.searchParams.set(
    "filter",
    `rect:${THANJAVUR_BOUNDS.west},${THANJAVUR_BOUNDS.south},${THANJAVUR_BOUNDS.east},${THANJAVUR_BOUNDS.north}`
  );
  url.searchParams.set(
    "bias",
    `rect:${THANJAVUR_BOUNDS.west},${THANJAVUR_BOUNDS.south},${THANJAVUR_BOUNDS.east},${THANJAVUR_BOUNDS.north}`
  );
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");

  const res = await fetch(url);
  if (!res.ok) return Response.json([], { status: 502 });
  const data = await res.json();

  const results = (data.features ?? []).map((f: { properties: { lat: number; lon: number; formatted: string; street?: string; city?: string; postcode?: string } }) => ({
    lat: f.properties.lat,
    lon: f.properties.lon,
    display_name: f.properties.formatted,
    street: f.properties.street ?? "",
    city: f.properties.city ?? "",
    postcode: f.properties.postcode ?? "",
  }));

  return Response.json(results);
}
