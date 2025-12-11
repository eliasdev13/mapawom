// ================================================
// APP.JSX FINAL CON:
// - Toggle Sidebar con WOM logo afuera
// - Leyenda flotante funcional
// - Vista Global / Individual / Dependencias
// ================================================

import { useState } from "react";

import SigmaGraph from "./components/Graph/SigmaGraph";
import Sidebar from "./components/Sidebar/Sidebar";
import EmptyState from "./components/EmptyState/EmptyState";
import LegendRF from "./components/Legend/LegendRF";
import womLogo from "./assets/womelectricidad.png"; // 🔥 IMPORTANTE

export default function App() {
  const [network, setNetwork] = useState(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [focusNode, setFocusNode] = useState(null);
  const [individualView, setIndividualView] = useState(false);
  const [dependencyNode, setDependencyNode] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  // ============================================
  // CARGA JSON
  // ============================================
  const handleLoadNetwork = (net) => {
    if (!net?.nodes || !net?.edges) {
      alert("JSON inválido. Debe contener {nodes:[], edges:[]}");
      return;
    }

    setNetwork(net);

    // Reset general
    setSelectedNode(null);
    setFocusNode(null);
    setIndividualView(false);
    setDependencyNode(null);

    setSidebarOpen(true); // abrir sidebar al cargar
  };

  // ============================================
  // VISTA INDIVIDUAL
  // ============================================
  const handleGoToNode = (id) => {
    setIndividualView(true);
    setFocusNode(id);
    setDependencyNode(null); // Dependencias apagadas en individual
  };

  // ============================================
  // VOLVER A GLOBAL
  // ============================================
  const handleBackToGlobal = () => {
    setIndividualView(false);
    setFocusNode(null);
    setDependencyNode(null);
  };

  // ============================================
  // DEPENDENCIAS RF → GLOBAL O INDIVIDUAL
  // ============================================
  const handleShowDependencies = (id) => {
    // Toggle dependencias
    if (dependencyNode === id) {
      setDependencyNode(null);
      return;
    }

    setDependencyNode(id);
  };

  // ============================================
  // APP SIN DATOS (EMPTY STATE)
  // ============================================
  if (!network) {
    return <EmptyState onLoadNetwork={handleLoadNetwork} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* =====================================================
          BOTÓN WOM LOGO (ABRE / CIERRA SIDEBAR)
          SIEMPRE VISIBLE
      ====================================================== */}
      <button
        className="toggle-sidebar-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "white",
          border: "2px solid #4c1d95",
          cursor: "pointer",
          padding: 4,
          zIndex: 99999,
        }}
      >
        <img
          src={womLogo}
          alt="menu"
          style={{ width: "100%", height: "100%" }}
        />
      </button>

      {/* =====================================================
          SIDEBAR PROFESIONAL
      ====================================================== */}
      <Sidebar
        network={network}
        selectedNode={selectedNode}
        onSelectNode={setSelectedNode}
        onGoToNode={handleGoToNode}
        onBackToGlobal={handleBackToGlobal}
        isIndividualView={individualView}
        onShowDependencies={handleShowDependencies}
        selectedDependency={dependencyNode}
        onLoadNetwork={handleLoadNetwork}
        sidebarOpen={sidebarOpen}
      />

      {/* =====================================================
          ÁREA DEL GRAFO SIGMA
      ====================================================== */}
      <div style={{ flex: 1, position: "relative" }}>

        {/* =====================================================
            BOTÓN PARA MOSTRAR / OCULTAR LEYENDA
        ====================================================== */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#4c1d95",
            border: "none",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            zIndex: 2000,
          }}
        >
          📡
        </button>

        {/* LEYENDA RF */}
        {showLegend && <LegendRF />}

        {/* =====================================================
            SIGMA GRAPH
        ====================================================== */}
        <SigmaGraph
          network={network}
          onSelectNode={setSelectedNode}
          focusNode={focusNode}
          individualView={individualView}
          dependencyNode={dependencyNode}
        />
      </div>
    </div>
  );
}
