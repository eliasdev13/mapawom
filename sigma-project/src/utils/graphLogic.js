// src/utils/graphLogic.js

export function buildAdjacency(nodes, edges) {
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));

  edges.forEach((e) => {
    if (!adj[e.source]) adj[e.source] = [];
    if (!adj[e.target]) adj[e.target] = [];
    adj[e.source].push(e.target);
    adj[e.target].push(e.source);
  });

  return adj;
}

export function bfsWithEdges(graph, adj, startNode, maxDepth = 40) {
  const visited = new Set([startNode]);
  const layers = { 0: [startNode] };

  for (let d = 1; d <= maxDepth; d++) {
    layers[d] = [];
    for (const node of layers[d - 1]) {
      (adj[node] || []).forEach((nbr) => {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          layers[d].push(nbr);
        }
      });
    }
  }

  const edgeKeys = [];
  graph.forEachEdge((key, _, s, t) => {
    if (visited.has(s) && visited.has(t)) edgeKeys.push(key);
  });

  return { layers, nodes: visited, edges: edgeKeys };
}

// (no la usamos ahora, pero la dejo)
export function computeDependenciesRF(adj, startNode) {
  const visited = new Set([startNode]);
  const queue = [startNode];

  while (queue.length) {
    const node = queue.shift();
    (adj[node] || []).forEach((nbr) => {
      if (!visited.has(nbr)) {
        visited.add(nbr);
        queue.push(nbr);
      }
    });
  }

  visited.delete(startNode);
  return visited;
}
