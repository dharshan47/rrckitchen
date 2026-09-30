export async function POST(req: Request) {
  const { kitchenPos, customerPos } = await req.json();

  if (!kitchenPos || !customerPos) {
    return Response.json({ route: null, etaMinutes: null }, { status: 400 });
  }

  function getFallback(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    const distanceKm = +(d * 1.4).toFixed(1);
    const etaMinutes = Math.max(1, Math.round(distanceKm * 2.4 + 3));
    return { route: [[lat1, lon1], [lat2, lon2]], etaMinutes, distanceKm };
  }

  try {
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
      return Response.json(getFallback(kitchenPos[0], kitchenPos[1], customerPos[0], customerPos[1]));
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      return Response.json(getFallback(kitchenPos[0], kitchenPos[1], customerPos[0], customerPos[1]));
    }

    const coords = feature.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );
    const etaMinutes = Math.round(feature.properties.summary.duration / 60);
    const distanceKm = +(feature.properties.summary.distance / 1000).toFixed(1);

    return Response.json({ route: coords, etaMinutes, distanceKm });
  } catch {
    return Response.json(getFallback(kitchenPos[0], kitchenPos[1], customerPos[0], customerPos[1]));
  }
}
