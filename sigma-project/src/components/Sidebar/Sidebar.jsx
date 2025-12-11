// ============================================================
// SIDEBAR PROFESIONAL TELECOM — V22 FINAL + VALIDADOR
// ============================================================

import { useState, useMemo, useRef } from "react";
import {
  FaPlug,
  FaSearch,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCircle,
  FaNetworkWired,
  FaMapMarkerAlt,
  FaArrowLeft
} from "react-icons/fa";

import womLogo from "../../assets/womelectricidad.png";
import exampleNetwork from "../../data/network.json";

import { validateNetworkJSON } from "../../utils/validateNetworkJson";

import "./Sidebar.css";

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
  sidebarOpen
}) {
  const [search, setSearch] = useState("");
  const fileRef = useRef(null);

  const nodes = network?.nodes || [];
  const edges = network?.edges || [];

  // ===============================
  // LISTA DE IDS
  // ===============================
  const allNodes = useMemo(() => nodes.map((n) => n.id), [nodes]);

  const hubs = useMemo(
    () => nodes.filter((n) => n.tipo === "Hub").map((n) => n.id),
    [nodes]
  );

  // ===============================
  // ADJACENCIA
  // ===============================
  const adjacency = useMemo(() => {
    const adj = {};
    allNodes.forEach((id) => (adj[id] = []));
    edges.forEach((e) => {
      if (adj[e.source]) adj[e.source].push(e.target);
      if (adj[e.target]) adj[e.target].push(e.source);
    });
    return adj;
  }, [allNodes, edges]);


  // ===============================
  // BUSCADOR
  // ===============================
  const filtered = useMemo(() => {
    if (!search) return [];
    return allNodes.filter((id) =>
      id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allNodes]);


  // ===============================
  // FORECAST VENCIDO
  // ===============================
  const isForecastExpired = (f) => {
    if (!f) return false;
    const d = new Date(f);
    return !isNaN(d) && d < new Date();
  };


  // ===============================
  // RESUMEN DE NODOS
  // ===============================
  const countON = nodes.filter((n) => n.estado === "ON").length;
  const countOFF = nodes.filter((n) => n.estado === "OFF").length;
  const countUnknown = nodes.filter((n) => n.estado === "DESCONOCIDO").length;
  const countExpired = nodes.filter((n) => isForecastExpired(n.forecast)).length;


  // ===============================
  // SELECCIÓN DE NODO
  // ===============================
  const selectNodeById = (id, go = false) => {
    const nodeData = nodes.find((n) => n.id === id);
    if (!nodeData) return;

    const neighbors = adjacency[id] || [];

    onSelectNode({
      ...nodeData,
      neighbors,
      esHub: nodeData.tipo === "Hub"
    });

    if (go) onGoToNode(id);
  };


  // ===============================
  // SUBIR ARCHIVO JSON (VALIDADO)
  // ===============================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);

        // VALIDADOR
        const errors = validateNetworkJSON(json);
        if (errors.length > 0) {
          alert("❌ Error en archivo JSON:\n\n" + errors.join("\n"));
          return;
        }

        onLoadNetwork(json);
      } catch {
        alert("❌ Archivo no tiene un formato JSON válido.");
      }
    };

    reader.readAsText(file);
  };


  // ===============================
  // BOTÓN GLOBAL/INDIVIDUAL/DEPENDENCIAS
  // ===============================
  let mainButtonText = "";
  let mainButtonAction = null;

  if (isIndividualView) {
    mainButtonText = "⬅ Vista global";
    mainButtonAction = () => {
      onBackToGlobal();
      onShowDependencies(null);
    };
  } else if (selectedDependency !== null) {
    mainButtonText = "🌐 Quitar dependencias";
    mainButtonAction = () => onShowDependencies(selectedDependency);
  }


  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>

      {/* HEADER */}
      <div className="sidebar-header">
        <button className="sidebar-logo-btn" onClick={onToggleSidebar}>
          <img src={womLogo} className="sidebar-logo-no-border" />
        </button>

        <div className="sidebar-title">
          <h2>Panel RF WOM</h2>
          <p>Estado & Dependencias</p>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="sidebar-content">

        {/* ========== RESUMEN ========== */}
        <div className="sidebar-block">
          <div className="block-title"><FaInfoCircle /> Resumen</div>

          <p><FaCircle color="#16a34a" /> ON: <strong>{countON}</strong></p>
          <p><FaCircle color="#ef4444" /> OFF: <strong>{countOFF}</strong></p>
          <p><FaCircle color="#cbd5e1" /> Desconocido: <strong>{countUnknown}</strong></p>
          <p><FaExclamationTriangle color="#ff4444" /> Forecast vencido: <strong>{countExpired}</strong></p>
        </div>

        {/* ========== CARGA JSON ========== */}
        <div className="sidebar-block">
          <div className="block-title"><FaPlug /> Datos de red</div>

          <div className="upload-buttons">
            <label className="empty-btn primary">
              📁 Cargar JSON
              <input hidden ref={fileRef} type="file" accept=".json" onChange={handleFileChange} />
            </label>

            <button className="empty-btn secondary" onClick={() => onLoadNetwork(exampleNetwork)}>
              🧪 Demo
            </button>
          </div>
        </div>

        {/* ========== SELECTOR HUBS ========== */}
        <div>
          <label className="label">Filtrar por Hub:</label>
          <select className="hub-select" onChange={(e) => e.target.value && selectNodeById(e.target.value, true)}>
            <option value="">-- seleccionar --</option>
            {hubs.map((h) => (
              <option key={h} value={h}>⬢ {h}</option>
            ))}
          </select>
        </div>

        {/* ========== BUSCADOR ========== */}
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
                <li key={id} onClick={() => { selectNodeById(id); setSearch(""); }}>
                  🔍 {id}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ========== PANEL DE INFORMACIÓN ========== */}
        <div className="sidebar-panel info-panel">
          {!selectedNode ? (
            <p className="empty-msg">Selecciona un nodo…</p>
          ) : (
            <>
              <div className="node-title">
                {selectedNode.esHub && "⬢ "}
                {selectedNode.id}
              </div>

              <p>
                <strong>Estado:</strong>{" "}
                <span className={`state ${selectedNode.estado.toLowerCase()}`}>
                  {selectedNode.estado}
                </span>
              </p>

              <p>
                <strong>Forecast:</strong>{" "}
                {isForecastExpired(selectedNode.forecast) ? "⚠ Vencido" : selectedNode.forecast || "N/A"}
              </p>

              <p><strong>Tipo:</strong> {selectedNode.tipo}</p>

              <p><FaMapMarkerAlt /> {selectedNode.lat ?? "N/A"}, {selectedNode.lng ?? "N/A"}</p>

              <hr />

              <p className="conn-title"><FaNetworkWired /> Conexiones:</p>

              <ul className="conn-list">
                {selectedNode.neighbors?.length
                  ? selectedNode.neighbors.map((n) => (
                      <li key={n} className="conn-item" onClick={() => selectNodeById(n)}>
                        ↪ {n}
                      </li>
                    ))
                  : <li>Sin conexiones</li>
                }
              </ul>

              <div className="panel-buttons">

                <button className="btn blue" onClick={() => onGoToNode(selectedNode.id)}>
                  🔭 Vista individual
                </button>

                <button className="btn orange" onClick={() => onShowDependencies(selectedNode.id)}>
                  ⚡ Dependencias RF
                </button>

                {mainButtonText && (
                  <button className="btn dark" onClick={mainButtonAction}>
                    {mainButtonText}
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
