type Triple = [number, number, number];
const frontRoom = (p: Triple) => Math.abs(p[0]) > 3.8 && p[2] >= 4.2 && p[2] <= 7.7;
export function cameraPath(from: Triple, to: Triple): Triple[] {
  const path: Triple[] = [];
  let current = from;
  const add = (p: Triple) => {
    if (Math.hypot(p[0] - current[0], p[2] - current[2]) > .001) path.push(p);
    current = p;
  };
  // Front rooms open sideways, so leave along their portal axis first.
  if (frontRoom(from)) add([0, 1.65, 5.7]);
  if (frontRoom(to)) {
    if (current[2] < 2.8 || Math.abs(current[0]) > 1) {
      add([current[0], 1.65, 3]); add([0, 1.65, 3]);
    }
    add([0, 1.65, 5.7]); add(to);
  } else {
    if (Math.abs(current[0] - to[0]) > 1 && (current[2] < 2.8 || to[2] < 2.8)) {
      add([current[0], 1.65, 3]); add([to[0], 1.65, 3]);
    }
    add(to);
  }
  return path;
}
