// src/components/Graph/SigmaGraph.jsx

import { useRef, useEffect } from "react";
import Graph from "graphology";
import Sigma from "sigma";
import { buildAdjacency, bfsWithEdges } from "./graphLogic";

export default function SigmaGraph({
  network,
  onSelectNode,
  focusNode,
  individualView,
  dependencyNode,
}) {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const graphRef = useRef(null);
  const adjacencyRef = useRef(null);

  const savedPositions = useRef({});
  const physicsRef = useRef(null);
  const blinkRef = useRef(null);

  const inIndividual = useRef(false);
  const draggingCluster = useRef(null);
  const lastPointer = useRef({ x: 0, y: 0 });

  const dependencyNodeRef = useRef(null);
  useEffect(() => {
    dependencyNodeRef.current = dependencyNode;
  }, [dependencyNode]);

  // ============================================
  // CREACIÓN DEL GRAFO Y RENDERER
  // ============================================
  useEffect(() => {
    if (!network) return;

    const container = containerRef.current;
    if (!container) return;

    // Limpieza previa
    if (sigmaRef.current) {
      try {
        sigmaRef.current.kill();
      } catch {}
      sigmaRef.current = null;
    }
    if (physicsRef.current) {
      clearInterval(physicsRef.current);
      physicsRef.current = null;
    }
    if (blinkRef.current) {
      clearInterval(blinkRef.current);
      blinkRef.current = null;
    }

    const graph = new Graph();
    graphRef.current = graph;

    const { nodes, edges } = network;
    const adjacency = buildAdjacency(nodes, edges);
    adjacencyRef.current = adjacency;

    // === NODOS ===
    nodes.forEach((n) => {
      const isHub = n.tipo === "Hub";

      const baseColor =
        n.estado === "ON"
          ? "#16a34a"
          : n.estado === "OFF"
          ? "#ef4444"
          : "#9ca3af";
        
      graph.addNode(n.id, {
        x: Math.random() * 1600,
        y: Math.random() * 1600,
        size: isHub ? 20 : 12,
        label: n.id,
        tipo: n.tipo,
        estado: n.estado,
        lat: n.lat,
        lng: n.lng,
        forecast: n.forecast || null,
        color: baseColor,
        originalColor: baseColor,
      });
    });

    // === ARISTAS ===
    edges.forEach((e) => {
      if (graph.hasNode(e.source) && graph.hasNode(e.target)) {
        graph.addEdge(e.source, e.target, {
          size: 3,
          color: "#9ca3af",
        });
      }
    });

    // === SIGMA ===
    const renderer = new Sigma(graph, container);
    sigmaRef.current = renderer;

    renderer.setSetting("labelSize", 11);
    renderer.setSetting("labelColor", { color: "black" });

    // ============================================
    // HOVER (solo en global sin dependencias)
    // ============================================
    renderer.on("enterNode", ({ node }) => {
      if (dependencyNodeRef.current || inIndividual.current) return;

      const adj = adjacencyRef.current || {};
      const neighbors = adj[node] || [];

      renderer.setSetting("nodeReducer", (n, data) => ({
        ...data,
        label: n === node || neighbors.includes(n) ? data.label : "",
        color:
          n === node || neighbors.includes(n)
            ? data.color
            : "#d1d5db",
      }));

      renderer.refresh();
    });

    renderer.on("leaveNode", () => {
      if (dependencyNodeRef.current || inIndividual.current) return;
      renderer.setSetting("nodeReducer", null);
      renderer.refresh();
    });

    // ============================================
    // CLICK NODE → selección y cluster arrastrable
    // ============================================
    renderer.on("clickNode", ({ node }) => {
      const g = graphRef.current;
      const adj = adjacencyRef.current || {};
      const attrs = g.getNodeAttributes(node);
      const neighbors = adj[node] || [];

      onSelectNode?.({
        id: node,
        tipo: attrs.tipo,
        estado: attrs.estado,
        lat: attrs.lat,
        lng: attrs.lng,
        forecast: attrs.forecast,
        neighbors,
        esHub: attrs.tipo === "Hub",
      });

      const { nodes: clusterNodes } = bfsWithEdges(g, adj, node, 5);
      draggingCluster.current = Array.from(clusterNodes);

      // Si hay dependencias o vista individual activa, no tocamos reducers
      if (dependencyNodeRef.current || inIndividual.current) {
        renderer.refresh();
        return;
      }

      const { nodes: bfsNodes, edges: bfsEdges } = bfsWithEdges(
        g,
        adj,
        node,
        40
      );

      renderer.setSetting("nodeReducer", (n, data) => ({
        ...data,
        color: bfsNodes.has(n) ? data.color : "#e5e7eb",
      }));

      renderer.setSetting("edgeReducer", (e, d) => ({
        ...d,
        hidden: !bfsEdges.includes(e),
      }));

      renderer.refresh();
    });

    // CLICK FONDO → reset global (solo si no hay dependencias ni individual)
    renderer.on("clickStage", () => {
      if (dependencyNodeRef.current || inIndividual.current) return;
      resetGraph(graph, renderer);
    });

    // ============================================
    // DRAG CLUSTER BFS
    // ============================================
    let dragging = false;

    renderer.on("downNode", ({ event }) => {
      if (!draggingCluster.current) return;
      dragging = true;
      lastPointer.current = { x: event.x, y: event.y };
    });

    renderer.getMouseCaptor().on("mousemovebody", (e) => {
      if (!dragging) return;

      const dx = e.x - lastPointer.current.x;
      const dy = e.y - lastPointer.current.y;
      lastPointer.current = { x: e.x, y: e.y };

      draggingCluster.current.forEach((id) => {
        if (!graph.hasNode(id)) return;
        const p = graph.getNodeAttributes(id);
        graph.setNodeAttribute(id, "x", p.x + dx);
        graph.setNodeAttribute(id, "y", p.y + dy);
      });

      renderer.refresh();
    });

    renderer.getMouseCaptor().on("mouseup", () => {
      dragging = false;
    });

    // ============================================
    // PARPADEO OFF / FORECAST VENCIDO (siempre)
    // ============================================
    let blink = false;
    blinkRef.current = setInterval(() => {
      const g = graphRef.current;
      const r = sigmaRef.current;
      if (!g || !r) return;

      blink = !blink;

      g.forEachNode((id, a) => {
        const vencido =
          a.forecast &&
          !isNaN(new Date(a.forecast)) &&
          new Date(a.forecast) < new Date();

        if (a.estado === "OFF" || vencido) {
          g.setNodeAttribute(
            id,
            "color",
            blink ? "#ff3333" : a.originalColor
          );
        } else {
          g.setNodeAttribute(id, "color", a.originalColor);
        }
      });

      r.refresh();
    }, 450);

    // ============================================
    // MOVIMIENTO ORBITAL SUAVE
    // ============================================
    physicsRef.current = setInterval(() => {
      const g = graphRef.current;
      const r = sigmaRef.current;
      if (!g || !r) return;

      g.forEachNode((id, a) => {
        const angle = Math.random() * Math.PI * 2;
        g.setNodeAttribute(id, "x", a.x + Math.cos(angle) * 0.4);
        g.setNodeAttribute(id, "y", a.y + Math.sin(angle) * 0.4);
      });

      r.refresh();
    }, 90);

    return () => {
      if (physicsRef.current) clearInterval(physicsRef.current);
      if (blinkRef.current) clearInterval(blinkRef.current);
      physicsRef.current = null;
      blinkRef.current = null;

      if (sigmaRef.current) {
        try {
          sigmaRef.current.kill();
        } catch {}
        sigmaRef.current = null;
      }
    };
  }, [network, onSelectNode]);

  // ============================================
  // DEPENDENCIAS RF (global / individual)
  // ============================================
  useEffect(() => {
    const graph = graphRef.current;
    const renderer = sigmaRef.current;
    const adj = adjacencyRef.current;
    if (!graph || !renderer || !adj) return;

    if (!dependencyNode) {
      renderer.setSetting("nodeReducer", null);
      renderer.setSetting("edgeReducer", null);
      renderer.refresh();
      return;
    }

    if (!graph.hasNode(dependencyNode)) return;

    const { layers } = bfsWithEdges(graph, adj, dependencyNode, 40);

    // nodos visibles actualmente (importante en vista individual)
    const visibleNodes = new Set();
    graph.forEachNode((n, attrs) => {
      if (!attrs.hidden) visibleNodes.add(n);
    });

    const depthMap = {};
    Object.entries(layers).forEach(([d, ids]) => {
      ids.forEach((id) => {
        if (visibleNodes.has(id)) depthMap[id] = Number(d);
      });
    });

    const bfsNodes = new Set(Object.keys(depthMap));

    // NODE REDUCER
    renderer.setSetting("nodeReducer", (n, data) => {
      if (!visibleNodes.has(n)) return data;

      if (!bfsNodes.has(n)) {
        // Nodo visible pero fuera del BFS → atenuado
        return {
          ...data,
          color: "#e5e7eb",
        };
      }

      const depth = depthMap[n];

      if (n === dependencyNode) {
        return {
          ...data,
          color: "#2563eb",
          size: data.size * 1.4,
        };
      }
      if (depth === 1) return { ...data, color: "#f97316" }; // naranja
      if (depth === 2) return { ...data, color: "#eab308" }; // amarillo

      return { ...data, color: "#9ca3af" }; // gris niveles ≥3
    });

    // EDGE REDUCER
    renderer.setSetting("edgeReducer", (e, d) => {
      const [s, t] = graph.extremities(e);
      if (bfsNodes.has(s) && bfsNodes.has(t)) return d;
      return { ...d, color: "#e5e7eb" };
    });

    renderer.refresh();
  }, [dependencyNode, individualView]);

  // ============================================
  // VISTA INDIVIDUAL (cluster circular)
  // ============================================
  useEffect(() => {
    const graph = graphRef.current;
    const renderer = sigmaRef.current;
    const adj = adjacencyRef.current;
    if (!graph || !renderer || !adj) return;

    if (individualView && focusNode && graph.hasNode(focusNode)) {
      inIndividual.current = true;

      const save = {};
      graph.forEachNode((n, a) => (save[n] = { x: a.x, y: a.y }));
      savedPositions.current = save;

      const { layers, nodes } = bfsWithEdges(graph, adj, focusNode, 40);

      graph.forEachNode((n) =>
        graph.setNodeAttribute(n, "hidden", !nodes.has(n))
      );
      graph.forEachEdge((e) => {
        const [s, t] = graph.extremities(e);
        graph.setEdgeAttribute(
          e,
          "hidden",
          !(nodes.has(s) && nodes.has(t))
        );
      });

      Object.entries(layers).forEach(([d, ids]) => {
        const depth = Number(d);
        const radius = depth * 260;
        const step = ids.length ? (2 * Math.PI) / ids.length : 0;

        ids.forEach((id, i) => {
          graph.setNodeAttribute(id, "x", radius * Math.cos(i * step));
          graph.setNodeAttribute(id, "y", radius * Math.sin(i * step));
        });
      });

      renderer.refresh();
      return;
    }

    if (!individualView && inIndividual.current) {
      inIndividual.current = false;

      Object.entries(savedPositions.current).forEach(([id, pos]) => {
        if (!graph.hasNode(id)) return;
        graph.setNodeAttribute(id, "x", pos.x);
        graph.setNodeAttribute(id, "y", pos.y);
        graph.setNodeAttribute(id, "hidden", false);
      });

      graph.forEachEdge((e) =>
        graph.setEdgeAttribute(e, "hidden", false)
      );

      renderer.setSetting("nodeReducer", null);
      renderer.setSetting("edgeReducer", null);
      renderer.refresh();
    }
  }, [individualView, focusNode]);

  // ============================================
  // CENTRAR EN focusNode
  // ============================================
  useEffect(() => {
    const renderer = sigmaRef.current;
    const graph = graphRef.current;
    if (!renderer || !graph || !focusNode) return;
    if (!graph.hasNode(focusNode)) return;

    const data = renderer.getNodeDisplayData(focusNode);
    if (!data) return;

    const camera = renderer.getCamera();
    camera.animate(
      { x: data.x, y: data.y, ratio: 0.25 },
      { duration: 600 }
    );
  }, [focusNode]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "white" }}
    />
  );
}

// ============================================
// RESET GLOBAL
// ============================================
function resetGraph(graph, renderer) {
  renderer.setSetting("nodeReducer", null);
  renderer.setSetting("edgeReducer", null);

  graph.forEachNode((n, attrs) => {
    graph.setNodeAttribute(n, "color", attrs.originalColor);
    graph.setNodeAttribute(n, "hidden", false);
  });

  graph.forEachEdge((e) => graph.setEdgeAttribute(e, "hidden", false));

  renderer.refresh();
}

function isNaNDate(d) {
  return isNaN(d.getTime());
}
