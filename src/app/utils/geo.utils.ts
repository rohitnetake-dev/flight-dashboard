type Coords = [number, number];

// point between two coordinates, progress is 0 to 1
export function interpolate(from: Coords, to: Coords, progress: number): Coords {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress
  ];
}

// angle in degrees (clockwise from north) as it looks on the map,
// so the plane icon lines up with the straight route line
export function getHeading(from: Coords, to: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2));

  const dx = toRad(to[1] - from[1]);
  const dy = mercatorY(to[0]) - mercatorY(from[0]);
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}
