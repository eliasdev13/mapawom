// ===============================================
// SIDEBAR PROFESIONAL V4 — WOM TELECOM
// ===============================================

import { useState, useMemo } from "react";
import network from "../data/network.json";
import womLogo from "../assets/womelectricidad.png";

export default function Sidebar({
  selectedNode,
  onGoToNode,
  onBackToGlobal,
  isIndividualView,
  onShowDependencies,
  onResetGraph,
  onToggleSidebar, // <-- NUEVO
}) {
  const [search, setSearch] = useState("");

  // Lista completa de nodos
  const allNodes = useMemo(() => network.nodes.map((n) => n.id), []);

  // Lista de hubs
  const hubs = useMemo(
    () => network.nodes.filter((n) => n.tipo === "Hub").map((n) => n.id),
    []
  );

  // Buscador
  const filtered = useMemo(() => {
    if (!search) return [];
    const s = search.toLowerCase();
    return allNodes.filter((id) => id.toLowerCase().includes(s)).slice(0, 25);
  }, [search, allNodes]);

  const aislado =
    selectedNode &&
    (!selectedNode.neighbors || selectedNode.neighbors.length === 0);

  return (
    <aside
      style={{
        width: 340,
        background: "#4c1d95", // Morado WOM
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        borderRight: "3px solid #3b0d80",
        boxShadow: "4px 0 14px rgba(0,0,0,0.25)",
      }}
    >
      {/* ================================
          HEADER CON LOGO COMO BOTÓN
      ================================= */}
      <div
        style={{
          height: 70,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          borderBottom: "2px solid #3b0d80",
          background:
            "linear-gradient(to right, rgba(76,29,149,1), rgba(76,29,149,0.6))",
        }}
      >
        {/* BOTÓN HAMBURGUESA (LOGO) */}
        <button
          onClick={onToggleSidebar}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: 48,
            height: 48,
            padding: 0,
          }}
        >
          <img
            src={womLogo}
            alt="menu"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </button>

        <div style={{ marginLeft: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: "bold", margin: 0 }}>
            Panel RF WOM
          </h2>
          <p
            style={{
              fontSize: 11,
              color: "#e9d5ff",
              margin: 0,
              marginTop: 4,
            }}
          >
            Estado, dependencias y conexiones.
          </p>
        </div>
      </div>

      {/* ================================
          CONTENIDO SCROLLEABLE
      ================================= */}
      <div
        style={{
          flex: 1,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto",
        }}
      >
        {/* ================================
            FILTRO POR HUB
        ================================= */}
        <div>
          <label style={{ color: "#f5d0fe", fontSize: 13 }}>
            Filtrar por Hub:
          </label>

          <select
            onChange={(e) => e.target.value && onGoToNode(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              background: "#3b0d80",
              border: "1px solid #5b21b6",
              borderRadius: 6,
              color: "white",
              marginTop: 6,
              fontSize: 13,
            }}
          >
            <option value="">-- Seleccionar Hub --</option>
            {hubs.map((hub) => (
              <option key={hub} value={hub}>
                ⬢ {hub}
              </option>
            ))}
          </select>
        </div>

        {/* ================================
            BUSCADOR GENERAL
        ================================= */}
        <div>
          <input
            type="text"
            placeholder="Buscar nodo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              background: "#3b0d80",
              border: "1px solid #5b21b6",
              borderRadius: 6,
              color: "white",
              fontSize: 13,
            }}
          />

          {filtered.length > 0 && (
            <ul
              style={{
                marginTop: 6,
                maxHeight: 180,
                overflowY: "auto",
                background: "#3b0d80",
                border: "1px solid #5b21b6",
                borderRadius: 6,
                listStyle: "none",
                padding: 0,
              }}
            >
              {filtered.map((id) => (
                <li
                  key={id}
                  onClick={() => {
                    setSearch("");
                    onGoToNode(id);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #4c1d95",
                    cursor: "pointer",
                  }}
                >
                  🔍 {id}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================================
            PANEL DE INFORMACIÓN
        ================================= */}
        <div
          style={{
            background: "#3b0d80",
            borderRadius: 8,
            border: "1px solid #5b21b6",
            padding: 12,
            fontSize: 13,
          }}
        >
          {!selectedNode ? (
            <p style={{ color: "#e9d5ff" }}>
              Selecciona un nodo del mapa para ver detalles…
            </p>
          ) : (
            <>
              <h3
                style={{
                  fontSize: 16,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {selectedNode.esHub && <span>⬢</span>}
                <span>{selectedNode.id}</span>
              </h3>

              <p>
                <strong>Tipo:</strong> {selectedNode.tipo}
              </p>

              <p>
                <strong>Estado:</strong>{" "}
                <span
                  style={{
                    color:
                      selectedNode.estado === "ON"
                        ? "#22c55e"
                        : selectedNode.estado === "OFF"
                        ? "#ef4444"
                        : "#facc15",
                  }}
                >
                  {selectedNode.estado}
                </span>
              </p>

              {"lat" in selectedNode && (
                <p>
                  <strong>Lat:</strong> {selectedNode.lat}
                </p>
              )}
              {"lng" in selectedNode && (
                <p>
                  <strong>Lng:</strong> {selectedNode.lng}
                </p>
              )}
              {"forecast" in selectedNode && (
                <p>
                  <strong>Forecast:</strong>{" "}
                  {selectedNode.forecast || "N/A"}
                </p>
              )}

              <p>
                <strong>Aislado:</strong> {aislado ? "✔ Sí" : "No"}
              </p>

              <hr
                style={{
                  margin: "10px 0",
                  borderColor: "#5b21b6",
                }}
              />

              <p style={{ fontWeight: "bold" }}>Conexiones:</p>
              <ul style={{ marginLeft: 16 }}>
                {selectedNode.neighbors?.length
                  ? selectedNode.neighbors.map((n) => (
                      <li key={n}>↪ {n}</li>
                    ))
                  : "Sin conexiones"}
              </ul>

              {/* ================================
                  BOTONES DE ACCIÓN RF
              ================================= */}
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <button
                  onClick={() => onGoToNode(selectedNode.id)}
                  style={{
                    padding: "7px",
                    borderRadius: 6,
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  🔭 Vista individual
                </button>

                {isIndividualView && (
                  <button
                    onClick={onBackToGlobal}
                    style={{
                      padding: "7px",
                      borderRadius: 6,
                      border: "none",
                      background: "#1e1b4b",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    ⬅ Volver a vista global
                  </button>
                )}

                <button
                  onClick={() => onShowDependencies(selectedNode.id)}
                  style={{
                    padding: "7px",
                    borderRadius: 6,
                    border: "none",
                    background: "#fb923c",
                    color: "#111827",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ⚡ Ver dependencias RF
                </button>

                <button
                  onClick={onResetGraph}
                  style={{
                    padding: "7px",
                    borderRadius: 6,
                    border: "none",
                    background: "#0f172a",
                    color: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  🌐 Ver red completa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
