import { NextResponse } from 'next/server';

const MAPTILER_KEY = 'GWgqgaHGL6LiYlf1JeDi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const waypoints: Array<[number, number] | { lat: number; lng: number }> = body.waypoints || [];

    if (!waypoints || waypoints.length < 2) {
      return NextResponse.json(
        { error: 'Kamida 2 ta waypoint nuqtalari kiritilishi shart' },
        { status: 400 }
      );
    }

    // Standardize to [[lat, lng], ...]
    const normalizedPoints: Array<[number, number]> = waypoints.map(p => {
      if (Array.isArray(p)) return [p[0], p[1]];
      return [p.lat, p.lng];
    });

    // Format: "lng,lat;lng,lat;..."
    const coordString = normalizedPoints
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';');

    // 1. First attempt: MapTiler Directions API v2
    try {
      const maptilerUrl = `https://api.maptiler.com/directions/v2/driving/${coordString}?key=${MAPTILER_KEY}&geometries=geojson&overview=full&steps=true`;
      const mtRes = await fetch(maptilerUrl, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      });

      if (mtRes.ok) {
        const mtData = await mtRes.json();
        if (mtData.code === 'Ok' && mtData.routes && mtData.routes.length > 0) {
          const route = mtData.routes[0];
          // MapTiler GeoJSON is [lng, lat] -> convert to [lat, lng]
          const roadCoords: Array<[number, number]> = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          return NextResponse.json({
            success: true,
            provider: 'MapTiler Directions API',
            code: 'Ok',
            coordinates: roadCoords,
            distanceMeters: route.distance,
            durationSeconds: route.duration
          });
        }
      }
    } catch (mtErr) {
      console.warn('MapTiler Directions API fallback triggering:', mtErr);
    }

    // 2. High-availability Fallback: OSRM Driving Engine
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const osrmRes = await fetch(osrmUrl, { next: { revalidate: 3600 } });
    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
        const roadCoords: Array<[number, number]> = osrmData.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        return NextResponse.json({
          success: true,
          provider: 'OSRM Driving Engine (Fallback)',
          code: 'Ok',
          coordinates: roadCoords,
          distanceMeters: osrmData.routes[0].distance,
          durationSeconds: osrmData.routes[0].duration
        });
      }
    }

    return NextResponse.json({ error: 'Yo\'nalish topilmadi' }, { status: 404 });
  } catch (error: any) {
    console.error('Routing Geometry Error:', error);
    return NextResponse.json(
      { error: 'Marshrut geometriyasini olishda xatolik', message: error.message },
      { status: 500 }
    );
  }
}
