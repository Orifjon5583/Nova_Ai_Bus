import { NextResponse } from 'next/server';

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

    // OSRM expects coordinates in "lng,lat" format separated by semicolon
    const coordString = normalizedPoints
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';');

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true&annotations=true`;

    const osrmResponse = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'NovaMaktabBusApp/1.0',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!osrmResponse.ok) {
      throw new Error(`OSRM server javobi xato: ${osrmResponse.status}`);
    }

    const data = await osrmResponse.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const bestRoute = data.routes[0];
      
      // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
      const roadCoordinates: Array<[number, number]> = bestRoute.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      return NextResponse.json({
        success: true,
        code: 'Ok',
        coordinates: roadCoordinates,
        distanceMeters: bestRoute.distance,
        durationSeconds: bestRoute.duration,
        waypointCount: roadCoordinates.length
      });
    }

    return NextResponse.json(
      { error: 'Yo\'nalish topilmadi', raw: data },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('OSRM Backend Routing Error:', error);
    return NextResponse.json(
      { error: 'OSRM routing serverida xatolik', message: error.message },
      { status: 500 }
    );
  }
}
