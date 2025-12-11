import "./EmptyState.css";
import womLogo from "../../assets/womelectricidad.png";
import example from "../../data/network.json";
import { validateNetworkJSON } from "../../utils/validateNetworkJson";

export default function EmptyState({ onLoadNetwork }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);

        const errors = validateNetworkJSON(json);
        if (errors.length > 0) {
          alert("❌ Errores en el JSON:\n\n" + errors.join("\n"));
          return;
        }

        onLoadNetwork(json);
      } catch {
        alert("❌ Archivo no válido.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="empty-container">
      <img src={womLogo} className="empty-logo" />

      <h1>No hay datos cargados</h1>
      <p className="empty-desc">Carga un archivo JSON o usa el ejemplo incluido.</p>

      <div className="empty-buttons">
        <label className="empty-btn primary">
          📁 Cargar JSON
          <input hidden type="file" accept=".json" onChange={handleFile} />
        </label>

        <button className="empty-btn secondary" onClick={() => onLoadNetwork(example)}>
          🧪 Usar ejemplo
        </button>
      </div>
    </div>
  );
}
