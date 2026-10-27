/** A walker's route on the floor, in three.js lab coordinates (x, z). `turn` corrects the model's own facing. */
export interface Patrol { points: [number, number][]; speed: number; loop: boolean; turn: number }

/** Position and heading (yaw whose +z axis points along the walk) after `distance` metres of the route. */
export function patrolAt({ points, loop, turn }: Patrol, distance: number): { x: number; z: number; heading: number } {
  // A loop closes on its first point; otherwise the walker turns round at the last one and comes back.
  const route = loop ? [...points, points[0]!] : [...points, ...points.slice(0, -1).reverse()];
  const lengths = route.slice(1).map((to, i) => Math.hypot(to[0] - route[i]![0], to[1] - route[i]![1]));
  let left = distance % lengths.reduce((sum, length) => sum + length, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (left > lengths[i]!) { left -= lengths[i]!; continue; }
    const [x0, z0] = route[i]!, [x1, z1] = route[i + 1]!, k = lengths[i]! ? left / lengths[i]! : 0;
    return { x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k, heading: Math.atan2(x1 - x0, z1 - z0) + turn };
  }
  return { x: route[0]![0], z: route[0]![1], heading: turn };
}
