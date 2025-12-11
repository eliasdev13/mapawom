// ============================================================
// SIDEBAR PROFESIONAL TELECOM — V21 FINAL
// ============================================================

import { useState, useMemo, useRef } from "react";
import {
  FaPlug,
  FaSitemap,
  FaSearch,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaBroadcastTower,
  FaCircle,
  FaArrowLeft,
  FaInfoCircle,
  FaNetworkWired,
} from "react-icons/fa";

import womLogo from "../../assets/womelectricidad.png";
import "./Sidebar.css";
import exampleNetwork from "../../data/network.json";

export default function Sidebar({
  network,
  selectedNode,
  onSelectNode,
  onGoToNode,
  onBackToGlobal,
  isIndividualView,
  onShowDependencies,
  selectedDependency,
  onToggleSidebar,
  onLoadNetwork,
  sidebarOpen,
}) {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  const nodes = network?.nodes || [];
  const edges = network?.edges || [];

  // LISTA DE IDS
  const allNodes = useMemo(() => nodes.map((n) => n.id), [nodes]);

  // HUBS
  const hubs = useMemo(
    () => nodes.filter((n) => n.tipo === "Hub").map((n) => n.id),
    [nodes]
  );

  // ADJACENCIA
  const adjacency = useMemo(() => {
    const adj = {};
    allNodes.forEach((id) => (adj[id] = []));
    edges.forEach((e) => {
      adj[e.source]?.push(e.target);
      adj[e.target]?.push(e.source);
    });
    return adj;
  }, [allNodes, edges]);

  // BUSCADOR
  const filtered = useMemo(() => {
    if (!search) return [];
    return allNodes
      .filter((id) => id.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 20);
  }, [search, allNodes]);

  // FORECAST VENCIDO
  const isForecastExpired = (f) => {
    if (!f) return false;
    const d = new Date(f);
    return !isNaN(d) && d < new Date();
  };

  // RESUMEN RF
  const countON = nodes.filter((n) => n.estado === "ON").length;
  const countOFF = nodes.filter((n) => n.estado === "OFF").length;
  const countUnknown = nodes.filter((n) => n.estado === "DESCONOCIDO").length;
  const countExpired = nodes.filter((n) => isForecastExpired(n.forecast)).length;

  // SELECCIÓN DE NODO
  const selectNodeById = (id, go = false) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;

    const neighbors = adjacency[id] || [];

    onSelectNode({
      ...n,
      neighbors,
      esHub: n.tipo === "Hub",
    });

    if (go) onGoToNode(id);
  };

  // CARGA JSON
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (!json.nodes || !json.edges) throw new Error();
        onLoadNetwork(json);
      } catch {
        alert("JSON inválido.");
      }
    };
    reader.readAsText(file);
  };

  // ============================================================
  // BOTÓN ÚNICO DINÁMICO (VISTA GLOBAL / QUITAR DEPENDENCIAS / VOLVER)
  // ============================================================

  let mainBtnText = "";
  let mainBtnAction = null;

  if (isIndividualView) {
    mainBtnText = "⬅ Vista global";
    mainBtnAction = () => {
      onBackToGlobal();
      onShowDependencies(null);
    };
  } else if (selectedDependency !== null) {
    mainBtnText = "🌐 Quitar dependencias";
    mainBtnAction = () => onShowDependencies(selectedDependency); // toggle off
  } else {
    mainBtnText = "";
  }

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <button className="sidebar-logo-btn" onClick={onToggleSidebar}>
          <img src={womLogo} alt="logo" className="sidebar-logo-no-border" />
        </button>

        <div className="sidebar-title">
          <h2>Panel RF WOM</h2>
          <p>Monitoreo & Dependencias</p>
        </div>
      </div>

      <div className="sidebar-content">
        {/* RESUMEN */}
        <div className="sidebar-block">
          <div className="block-title">
            <FaInfoCircle /> Resumen de red
          </div>

          <p>
            <FaCircle color="#16a34a" /> ON: <strong>{countON}</strong>
          </p>
          <p>
            <FaCircle color="#ef4444" /> OFF: <strong>{countOFF}</strong>
          </p>
          <p>
            <FaCircle color="#cccccc" /> Desconocido: <strong>{countUnknown}</strong>
          </p>
          <p>
            <FaExclamationTriangle color="#ff3333" /> Forecast vencido:{" "}
            <strong>{countExpired}</strong>
          </p>
        </div>

        {/* CARGA JSON */}
        <div className="sidebar-block">
          <div className="block-title">
            <FaPlug /> Datos de red
          </div>

          <div className="upload-buttons">
            <label className="empty-btn primary">
              📁 Cargar JSON
              <input hidden type="file" accept=".json" onChange={handleFileChange} />
            </label>

            <button className="empty-btn secondary" onClick={() => onLoadNetwork(exampleNetwork)}>
              🧪 Demo
            </button>
          </div>

          <div style={{ height: 10 }} />

          <details className="json-structure">
            <summary>📄 Ver estructura JSON requerida</summary>
            <pre>
{`{
"nodes": [
 { "id": "A1", "tipo": "Access", "estado": "ON", "lat": -20.1, "lng": -70.2 }
],
"edges": [
 { "source": "A1", "target": "HUB-NORTE" }
]
}`}
            </pre>
          </details>
        </div>

        {/* SELECTOR HUB */}
        <div>
          <label className="label">Filtrar por Hub:</label>
          <select
            className="hub-select"
            onChange={(e) => e.target.value && selectNodeById(e.target.value, true)}
          >
            <option value="">-- seleccionar --</option>
            {hubs.map((h) => (
              <option key={h} value={h}>
                ⬢ {h}
              </option>
            ))}
          </select>
        </div>

        {/* BUSCADOR */}
        <div>
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Buscar nodo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length > 0 && (
            <ul className="search-list">
              {filtered.map((id) => (
                <li
                  key={id}
                  className="search-item"
                  onClick={() => {
                    selectNodeById(id);
                    setSearch("");
                  }}
                >
                  🔍 {id}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PANEL DE INFORMACIÓN */}
        <div className="sidebar-panel">
          {!selectedNode ? (
            <p className="empty-msg">Selecciona un nodo…</p>
          ) : (
            <>
              <h3 className="node-title">
                {selectedNode.esHub && "⬢ "}
                {selectedNode.id}
              </h3>

              <p>
                <strong>Tipo:</strong> {selectedNode.tipo}
              </p>

              <p>
                <strong>Estado:</strong>{" "}
                <span
                  className={
                    selectedNode.estado === "ON"
                      ? "state on"
                      : selectedNode.estado === "OFF"
                      ? "state off"
                      : "state unknown"
                  }
                >
                  {selectedNode.estado}
                </span>
              </p>

              <p>
                <strong>Forecast:</strong>{" "}
                {isForecastExpired(selectedNode.forecast)
                  ? "⚠ Vencido"
                  : selectedNode.forecast || "N/A"}
              </p>

              <p>
                <FaMapMarkerAlt /> {selectedNode.lat ?? "N/A"}, {selectedNode.lng ?? "N/A"}
              </p>

              <hr />

              <p className="conn-title">
                <FaNetworkWired /> Conexiones:
              </p>

              <ul className="conn-list">
                {selectedNode.neighbors?.length ? (
                  selectedNode.neighbors.map((n) => (
                    <li
                      key={n}
                      className="conn-item"
                      onClick={() => selectNodeById(n)}
                    >
                      ↪ {n}
                    </li>
                  ))
                ) : (
                  <li>Sin conexiones</li>
                )}
              </ul>

              <div className="panel-buttons">
                {/* Vista individual */}
                {!isIndividualView && (
                  <button className="btn blue" onClick={() => onGoToNode(selectedNode.id)}>
                    🔭 Vista individual
                  </button>
                )}

                {/* Dependencias */}
                <button
                  className="btn orange"
                  onClick={() => onShowDependencies(selectedNode.id)}
                >
                  ⚡ Dependencias RF
                </button>

                {/* Botón dinámico */}
                {mainBtnText && (
                  <button className="btn dark" onClick={mainBtnAction}>
                    {mainBtnText}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
