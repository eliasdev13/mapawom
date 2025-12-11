// ============================================
// SIGMA GRAPH v8 — TELECOM ORBITAL + DEP RF
// ============================================

import { useRef, useEffect } from "react";
import Graph from "graphology";
import { Sigma } from "sigma";

import { buildAdjacency, bfsWithEdges } from "../utils/graphLogic";
import network from "../data/network.json";

export default function SigmaGraph({
  onSelectNode,
  focusNode,
  individualView,
  dependencyNode, // nodo raíz para dependencias RF (puede ser null)
}) {
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const graphRef = useRef(null);
  const adjacencyRef = useRef(null);

  const savedPositions = useRef({});
  const inIndividual = useRef(false);

  // Dragging de cluster
  const draggingCluster = useRef(null);
  const lastPointer = useRef({ x: 0, y: 0 });

  // timers
  const physicsRef = useRef(null);
  const blinkRef = useRef(null);

  // para pulso de edge
  const edgePulseRef = useRef(false);

  // ref para saber si estamos en dependencias RF (para no pisar con hover)
  const dependencyNodeRef = useRef(null);

  // sync ref con prop
  useEffect(() => {
    dependencyNodeRef.current = dependencyNode;
  }, [dependencyNode]);

  // =====================================================
  //               RENDER INICIAL
  // =====================================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const graph = new Graph();
    graphRef.current = graph;

    const adjacency = buildAdjacency(network.nodes, network.edges);
    adjacencyRef.current = adjacency;

    // ===========================
    // NODOS
    // ===========================
    network.nodes.forEach((n) => {
      const esHub = n.tipo === "Hub";

      graph.addNode(n.id, {
        x: Math.random() * 1500,
        y: Math.random() * 1500,

        size: esHub ? 20 : 12,
        label: esHub ? `⬢ ${n.id}` : n.id,

        tipo: n.tipo,
        estado: n.estado,
        lat: n.lat,
        lng: n.lng,
        forecast: n.forecast || null,

        esHub,
        color:
          n.estado === "ON"
            ? "#16a34a"
            : n.estado === "OFF"
            ? "#ef4444"
            : "#eab308",
      });
    });

    // ===========================
    // ARISTAS
    // ===========================
    network.edges.forEach((e) => {
      if (graph.hasNode(e.source) && graph.hasNode(e.target)) {
        graph.addEdge(e.source, e.target, {
          size: 2,
          color: "#9ca3af",
        });
      }
    });

    // ===========================
    // SIGMA
    // ===========================
    const renderer = new Sigma(graph, container);
    sigmaRef.current = renderer;

    // labels más legibles
    renderer.setSetting("labelColor", { color: "#111827" });
    renderer.setSetting("labelSize", 10);

    // =====================================================
    // HOVER (solo si NO estamos en modo dependencias RF)
    // =====================================================
    renderer.on("enterNode", ({ node }) => {
      if (dependencyNodeRef.current) return; // no tocar reducers en modo dependencias

      const neighbors = adjacency[node] || [];

      renderer.setSetting("nodeReducer", (n, data) => ({
        ...data,
        label: n === node || neighbors.includes(n) ? data.label : "",
        color:
          n === node || neighbors.includes(n)
            ? data.color
            : "#d4d4d4",
      }));

      renderer.refresh();
    });

    renderer.on("leaveNode", () => {
      if (dependencyNodeRef.current) return; // en modo dependencias no tocamos nodeReducer
      renderer.setSetting("nodeReducer", null);
      renderer.refresh();
    });

    // =====================================================
    // CLICK NODE → selección + cluster arrastrable
    // (no cambiamos colores del cluster aquí)
    // =====================================================
    renderer.on("clickNode", ({ node }) => {
      const attrs = graph.getNodeAttributes(node);
      const neighbors = adjacency[node] || [];

      // Mandamos INFO completa al sidebar
      onSelectNode?.({
        id: node,
        ...attrs,
        neighbors,
      });

      // cluster arrastrable desde este nodo (BFS corto)
      const { nodes: clusterNodes } = bfsWithEdges(
        graph,
        adjacency,
        node,
        5
      );
      draggingCluster.current = Array.from(clusterNodes);
    });

    // =====================================================
    // CLICK FONDO → RESET VISUAL (sin tocar React state)
    // =====================================================
    renderer.on("clickStage", () => {
      renderer.setSetting("nodeReducer", null);
      renderer.setSetting("edgeReducer", null);

      graph.forEachNode((n) => {
        graph.setNodeAttribute(n, "hidden", false);
      });
      graph.forEachEdge((e) => {
        graph.setEdgeAttribute(e, "hidden", false);
      });

      renderer.refresh();
    });

    // =====================================================
    // PARPADEO OFF-AIR
    // =====================================================
    blinkRef.current = setInterval(() => {
      graph.forEachNode((id, attrs) => {
        if (attrs.estado === "OFF") {
          graph.setNodeAttribute(
            id,
            "color",
            attrs.color === "#ef4444" ? "#7f1d1d" : "#ef4444"
          );
        }
      });
      renderer.refresh();
    }, 700);

    // =====================================================
    // MOVIMIENTO ORBITAL + FUERZA LOCAL + ANIMACIÓN DE ENLACES
    // =====================================================
    physicsRef.current = setInterval(() => {
      // Movimiento orbital suave
      graph.forEachNode((id, attrs) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.8;
        const nx = attrs.x + Math.cos(angle) * radius;
        const ny = attrs.y + Math.sin(angle) * radius;
        graph.setNodeAttribute(id, "x", nx);
        graph.setNodeAttribute(id, "y", ny);
      });

      // Fuerza entre nodos conectados
      graph.forEachEdge((key, attrs, s, t) => {
        const a = graph.getNodeAttributes(s);
        const b = graph.getNodeAttributes(t);

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const ideal = 140;
        const force = (dist - ideal) * 0.002;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        graph.setNodeAttribute(s, "x", a.x + fx);
        graph.setNodeAttribute(s, "y", a.y + fy);
        graph.setNodeAttribute(t, "x", b.x - fx);
        graph.setNodeAttribute(t, "y", b.y - fy);
      });

      // ANIMACIÓN ENLACES
      edgePulseRef.current = !edgePulseRef.current;

      graph.forEachEdge((key, attrs, s, t) => {
        const a = graph.getNodeAttributes(s);
        const b = graph.getNodeAttributes(t);

        let color = "#9ca3af";
        if (a.estado === "OFF" || b.estado === "OFF") {
          color = "#ef4444";
        } else if (a.estado === "ON" && b.estado === "ON") {
          color = "#16a34a";
        } else {
          color = "#eab308";
        }

        const size = edgePulseRef.current ? 3 : 1.8;

        graph.setEdgeAttribute(key, "color", color);
        graph.setEdgeAttribute(key, "size", size);
      });

      renderer.refresh();
    }, 40);

    // =====================================================
    // CLUSTER DRAGGING (mueve conjunto de nodos conectados)
    // =====================================================
    let isDragging = false;

    renderer.on("downNode", ({ node, event }) => {
      if (!draggingCluster.current) return;
      isDragging = true;
      lastPointer.current = { x: event.x, y: event.y };
    });

    renderer.getMouseCaptor().on("mousemove", (e) => {
      if (!isDragging || !draggingCluster.current) return;

      const dx = e.x - lastPointer.current.x;
      const dy = e.y - lastPointer.current.y;
      lastPointer.current = { x: e.x, y: e.y };

      // Mover cluster
      draggingCluster.current.forEach((id) => {
        const p = graph.getNodeAttributes(id);
        graph.setNodeAttribute(id, "x", p.x + dx);
        graph.setNodeAttribute(id, "y", p.y + dy);
      });

      // Empuje suave para no superponer clusters
      network.nodes.forEach((n) => {
        if (draggingCluster.current.includes(n.id)) return;

        const pos = graph.getNodeAttributes(n.id);

        draggingCluster.current.forEach((id) => {
          const p = graph.getNodeAttributes(id);

          const dx2 = p.x - pos.x;
          const dy2 = p.y - pos.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

          if (dist < 80) {
            const push = (80 - dist) * 0.2;
            graph.setNodeAttribute(
              id,
              "x",
              p.x + (dx2 / dist) * push
            );
            graph.setNodeAttribute(
              id,
              "y",
              p.y + (dy2 / dist) * push
            );
          }
        });
      });

      renderer.refresh();
    });

    renderer.getMouseCaptor().on("mouseup", () => {
      isDragging = false;
    });

    // Cleanup
    return () => {
      if (physicsRef.current) clearInterval(physicsRef.current);
      if (blinkRef.current) clearInterval(blinkRef.current);
      renderer.kill();
    };
  }, [onSelectNode]);

  // ==========================================================
  //   DEPENDENCIAS RF (cascada por niveles)
  // ==========================================================
  useEffect(() => {
    const graph = graphRef.current;
    const renderer = sigmaRef.current;
    const adj = adjacencyRef.current;
    if (!graph || !renderer || !adj) return;

    if (!dependencyNode) {
      // reset visual cuando limpiamos dependencias
      renderer.setSetting("nodeReducer", null);
      renderer.setSetting("edgeReducer", null);
      graph.forEachNode((n) => graph.setNodeAttribute(n, "hidden", false));
      graph.forEachEdge((e) => graph.setEdgeAttribute(e, "hidden", false));
      renderer.refresh();
      return;
    }

    const { layers, nodes } = bfsWithEdges(
      graph,
      adj,
      dependencyNode,
      40
    );

    // mapear nodo -> profundidad
    const depthMap = {};
    Object.entries(layers).forEach(([d, group]) => {
      const depth = parseInt(d, 10);
      group.forEach((id) => {
        depthMap[id] = depth;
      });
    });

    renderer.setSetting("nodeReducer", (n, data) => {
      if (!nodes.has(n)) {
        // fuera del componente alcanzable
        return { ...data, color: "#e5e7eb" };
      }

      const depth = depthMap[n] ?? 0;

      if (n === dependencyNode) {
        return {
          ...data,
          color: "#2563eb",
          size: data.size * 1.3,
        };
      }

      if (depth === 1) {
        return {
          ...data,
          color: "#f97316", // primer nivel
        };
      }

      if (depth === 2) {
        return {
          ...data,
          color: "#eab308", // segundo nivel
        };
      }

      return {
        ...data,
        color: "#9ca3af", // niveles lejanos
      };
    });

    renderer.setSetting("edgeReducer", (e, data) => {
      const [s, t] = graph.extremities(e);
      const visible = nodes.has(s) && nodes.has(t);
      return {
        ...data,
        hidden: !visible,
      };
    });

    renderer.refresh();
  }, [dependencyNode]);

  // ==========================================================
  //    VISTA INDIVIDUAL ↔ GLOBAL
  // ==========================================================
  useEffect(() => {
    const graph = graphRef.current;
    const renderer = sigmaRef.current;
    const adjacency = adjacencyRef.current;

    if (!graph || !renderer) return;

    // VISTA INDIVIDUAL
    if (individualView && focusNode) {
      inIndividual.current = true;

      if (physicsRef.current) {
        clearInterval(physicsRef.current);
        physicsRef.current = null;
      }

      savedPositions.current = {};
      graph.forEachNode((n, a) => {
        savedPositions.current[n] = { ...a };
      });

      const { layers, nodes: clusterNodes, edges: clusterEdges } =
        bfsWithEdges(graph, adjacency, focusNode, 40);

      graph.forEachNode((n) =>
        graph.setNodeAttribute(n, "hidden", !clusterNodes.has(n))
      );

      graph.forEachEdge((e) =>
        graph.setEdgeAttribute(e, "hidden", !clusterEdges.includes(e))
      );

      Object.entries(layers).forEach(([depth, group]) => {
        const r = depth * 260;
        const angStep = group.length ? (2 * Math.PI) / group.length : 0;

        group.forEach((id, i) => {
          graph.setNodeAttribute(id, "x", r * Math.cos(i * angStep));
          graph.setNodeAttribute(id, "y", r * Math.sin(i * angStep));
        });
      });

      renderer.refresh();
      return;
    }

    // VOLVER A GLOBAL
    if (!individualView && inIndividual.current) {
      inIndividual.current = false;

      graph.forEachNode((n) => {
        const pos = savedPositions.current[n];
        if (pos) {
          graph.setNodeAttribute(n, "x", pos.x);
          graph.setNodeAttribute(n, "y", pos.y);
          graph.setNodeAttribute(n, "hidden", false);
        }
      });

      graph.forEachEdge((e) =>
        graph.setEdgeAttribute(e, "hidden", false)
      );

      // reactivar movimiento orbital si no existe
      if (!physicsRef.current) {
        physicsRef.current = setInterval(() => {
          graph.forEachNode((id, attrs) => {
            const angle = Math.random() * Math.PI * 2;
            const nx = attrs.x + Math.cos(angle) * 0.8;
            const ny = attrs.y + Math.sin(angle) * 0.8;
            graph.setNodeAttribute(id, "x", nx);
            graph.setNodeAttribute(id, "y", ny);
          });

          sigmaRef.current?.refresh();
        }, 40);
      }

      renderer.setSetting("nodeReducer", null);
      renderer.setSetting("edgeReducer", null);

      renderer.refresh();
    }
  }, [individualView, focusNode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#ffffff", // fondo blanco
      }}
    />
  );
}
