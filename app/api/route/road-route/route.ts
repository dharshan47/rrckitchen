export async function POST(req: Request) {
  const { kitchenPos, customerPos } = await req.json();

  if (!kitchenPos || !customerPos) {
    return Response.json({ route: null, etaMinutes: null }, { status: 400 });
  }

  const res = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        Authorization: process.env.ORS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [kitchenPos[1], kitchenPos[0]],
          [customerPos[1], customerPos[0]],
        ],
      }),
    }
  );

  if (!res.ok) {
    return Response.json({ route: null, etaMinutes: null });
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) {
    return Response.json({ route: null, etaMinutes: null });
  }

  const coords = feature.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
  );
  const etaMinutes = Math.round(feature.properties.summary.duration / 60);

  return Response.json({ route: coords, etaMinutes });
}
