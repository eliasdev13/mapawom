// src/components/Sidebar/FileUploader.jsx

import { useRef, useState } from "react";
import { validateNetworkJSON } from "../Graph/graphLogic";

export default function FileUploader({
  onNetworkLoaded,
  onNetworkError,
  exampleNetwork,
}) {
  const inputRef = useRef(null);
  const [showFormat, setShowFormat] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      onNetworkError?.("El archivo debe ser .json.");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const { valid, error } = validateNetworkJSON(json);
      if (!valid) {
        onNetworkError?.(error || "El JSON no tiene el formato esperado.");
        return;
      }

      onNetworkError?.("");
      onNetworkLoaded?.(json);
    } catch (err) {
      onNetworkError?.("No se pudo leer o parsear el JSON.");
    } finally {
      e.target.value = "";
    }
  };

  const handleUseExample = () => {
    if (!exampleNetwork) {
      onNetworkError?.("No se encontró el archivo de ejemplo.");
      return;
    }
    const { valid, error } = validateNetworkJSON(exampleNetwork);
    if (!valid) {
      onNetworkError?.(
        error || "El archivo de ejemplo no tiene el formato esperado."
      );
      return;
    }
    onNetworkError?.("");
    onNetworkLoaded?.(exampleNetwork);
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleClick}
          style={{
            flex: 1,
            padding: "7px 8px",
            borderRadius: 6,
            border: "1px solid #5b21b6",
            background: "#3b0764",
            color: "white",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          📥 Cargar JSON
        </button>

        <button
          onClick={handleUseExample}
          style={{
            padding: "7px 8px",
            borderRadius: 6,
            border: "1px solid #5b21b6",
            background: "#6d28d9",
            color: "white",
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          📄 Usar ejemplo
        </button>
      </div>

      <button
        onClick={() => setShowFormat((v) => !v)}
        style={{
          marginTop: 6,
          padding: "4px 6px",
          borderRadius: 4,
          border: "none",
          background: "transparent",
          color: "#e9d5ff",
          fontSize: 11,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        {showFormat ? "Ocultar formato esperado" : "Ver formato esperado"}
      </button>

      {showFormat && (
        <pre
          style={{
            marginTop: 4,
            background: "#3b0764",
            padding: 8,
            borderRadius: 6,
            fontSize: 11,
            maxHeight: 160,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
{`{
  "nodes": [
    { "id": "HUB-NORTE", "tipo": "Hub", "estado": "ON", "lat": -20.15, "lng": -70.12 },
    { "id": "AC-N1", "tipo": "Access", "estado": "OFF", "lat": -20.16, "lng": -70.13 }
  ],
  "edges": [
    { "source": "HUB-NORTE", "target": "AC-N1" }
  ]
}`}
        </pre>
      )}
    </div>
  );
}
