import example from "../../data/network.json";
import womLogo from "../../assets/womelectricidad.png"; // SIN BORDE
import "./EmptyState.css";

export default function EmptyState({ onLoadNetwork }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        onLoadNetwork(json);
      } catch {
        alert("Error leyendo JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="empty-container">
      <img src={womLogo} className="empty-logo" />

      <h1>No hay datos cargados</h1>

      <p className="empty-desc">
        Carga un archivo JSON o usa el ejemplo incluido para visualizar la red.
      </p>

      <div className="empty-buttons">
        <label className="empty-btn primary">
          📁 Cargar JSON
          <input type="file" accept=".json" onChange={handleFile} hidden />
        </label>

        <button className="empty-btn secondary" onClick={() => onLoadNetwork(example)}>
          🧪 Usar ejemplo
        </button>
      </div>

      <details className="json-structure">
        <summary>📄 Ver estructura JSON requerida</summary>
        <pre>
{`{
  "nodes": [
    {
      "id": "A1",
      "tipo": "Access",
      "estado": "ON | OFF | DESCONOCIDO",
      "lat": -20.124,
      "lng": -70.228,
      "forecast": "2025-02-10 | null"
    }
  ],
  "edges": [
    { "source": "A1", "target": "HUB-NORTE" }
  ]
}`}
        </pre>
      </details>
    </div>
  );
}
