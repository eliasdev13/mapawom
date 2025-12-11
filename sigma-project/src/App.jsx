// src/App.jsx

import { useState } from "react";
import SigmaGraph from "./components/SigmaGraph";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusNode, setFocusNode] = useState(null);
  const [individualView, setIndividualView] = useState(false);
  const [dependencyNode, setDependencyNode] = useState(null);

  // ⬅⬅⬅ NUEVO
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // funciones principales
  const handleGoToNode = (id) => {
    if (!id) return;
    setFocusNode(id);
    setIndividualView(true);
    setDependencyNode(null);
  };

  const handleBackToGlobal = () => {
    setIndividualView(false);
    setFocusNode(null);
  };

  const handleShowDependencies = (id) => {
    if (!id) return;
    setDependencyNode(id);
    setIndividualView(false);
    setFocusNode(null);
  };

  const handleResetGraph = () => {
    setSelectedNode(null);
    setFocusNode(null);
    setIndividualView(false);
    setDependencyNode(null);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* SIDEBAR con colapso */}
      {sidebarOpen && (
        <Sidebar
          selectedNode={selectedNode}
          onGoToNode={handleGoToNode}
          onBackToGlobal={handleBackToGlobal}
          isIndividualView={individualView}
          onShowDependencies={handleShowDependencies}
          onResetGraph={handleResetGraph}
          onToggleSidebar={() => setSidebarOpen(false)} // ⬅ NUEVO
        />
      )}

      {/* BOTÓN FLOTANTE CUANDO EL SIDEBAR ESTÁ CERRADO */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "2px solid #4c1d95",
            background: "white",
            padding: 6,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            zIndex: 999,
          }}
        >
          <img
            src="/src/assets/womelectricidad.png"
            alt="menu"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </button>
      )}

      {/* GRAFO */}
      <div style={{ flex: 1 }}>
        <SigmaGraph
          onSelectNode={setSelectedNode}
          focusNode={focusNode}
          individualView={individualView}
          dependencyNode={dependencyNode}
        />
      </div>
    </div>
  );
}
