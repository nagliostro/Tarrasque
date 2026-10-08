export type Vec3 = readonly [number, number, number];

export interface Wireframe {
  name: string;
  vertices: Vec3[];
  edges: [number, number][];
}

const PHI = (1 + Math.sqrt(5)) / 2;

/** Normaliza para que o vértice mais distante fique a distância 1 do centro. */
function unit(vertices: Vec3[]): Vec3[] {
  const radius = Math.max(...vertices.map(([x, y, z]) => Math.hypot(x, y, z)));
  return vertices.map(([x, y, z]) => [x / radius, y / radius, z / radius]);
}

/** Poliedros regulares: as arestas são os pares de vértices à menor distância. */
function nearestEdges(vertices: Vec3[]): [number, number][] {
  const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  let min = Infinity;
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      min = Math.min(min, dist(vertices[i]!, vertices[j]!));
  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      if (dist(vertices[i]!, vertices[j]!) < min * 1.01) edges.push([i, j]);
  return edges;
}

function regular(name: string, raw: Vec3[]): Wireframe {
  const vertices = unit(raw);
  return { name, vertices, edges: nearestEdges(vertices) };
}

function signs(values: readonly [number, number, number]): Vec3[] {
  const out: Vec3[] = [];
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      for (const sz of [1, -1]) out.push([values[0] * sx, values[1] * sy, values[2] * sz]);
  return out;
}

/** Permutações cíclicas de (0, ±a, ±b). */
function cyclic(a: number, b: number): Vec3[] {
  const out: Vec3[] = [];
  for (const s1 of [1, -1])
    for (const s2 of [1, -1])
      out.push([0, a * s1, b * s2], [a * s1, b * s2, 0], [b * s2, 0, a * s1]);
  return out;
}

/** d10: trapezoedro pentagonal, com a altura do anel ajustada para faces em pipa planas. */
function d10(): Wireframe {
  const apex = 1;
  const ring = 0.42;
  const vertices: Vec3[] = [
    [0, 0, apex],
    [0, 0, -apex],
  ];
  for (let i = 0; i < 5; i++) {
    const upper = (i * 2 * Math.PI) / 5;
    const lower = upper + Math.PI / 5;
    vertices.push([Math.cos(upper), Math.sin(upper), ring]);
    vertices.push([Math.cos(lower), Math.sin(lower), -ring]);
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const up = 2 + i * 2;
    const down = 3 + i * 2;
    const prevDown = 3 + ((i + 4) % 5) * 2;
    edges.push([0, up], [1, down], [up, down], [up, prevDown]);
  }
  return { name: 'd10', vertices: unit(vertices), edges };
}

export const DICE: Wireframe[] = [
  regular('d4', [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ]),
  regular('d6', signs([1, 1, 1])),
  regular('d8', [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]),
  d10(),
  regular('d12', [...signs([1, 1, 1]), ...cyclic(1 / PHI, PHI)]),
  regular('d20', cyclic(1, PHI)),
];
