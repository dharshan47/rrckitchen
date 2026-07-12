export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) return Response.json(null, { status: 400 });

  const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("apiKey", process.env.GEOAPIFY_API_KEY!);
  url.searchParams.set("lang", "en");

  const res = await fetch(url);
  if (!res.ok) return Response.json(null, { status: 502 });
  const data = await res.json();

  const props = data.features?.[0]?.properties ?? null;
  if (!props) return Response.json(null);

  return Response.json({
    lat: props.lat,
    lon: props.lon,
    display_name: props.formatted,
    street: props.street ?? "",
    city: props.city ?? "",
    postcode: props.postcode ?? "",
  });
}
