// src/components/LegendRF/LegendRF.jsx
import "./LegendRF.css";

export default function LegendRF() {
  return (
    <div className="legend-rf-container">
      <div className="legend-rf">
        <h4 className="legend-title">📡 Leyenda RF</h4>

        <div className="legend-section">
          <p><span className="legend-dot blue"></span> Nodo raíz (Dependencia RF)</p>
          <p><span className="legend-dot orange"></span> Nivel 1 – Riesgo alto</p>
          <p><span className="legend-dot yellow"></span> Nivel 2 – Riesgo medio</p>
          <p><span className="legend-dot gray"></span> Niveles ≥3</p>
        </div>

        <hr />

        <div className="legend-section">
          <p><span className="legend-dot green"></span> Nodo ON</p>
          <p><span className="legend-dot red"></span> Nodo OFF</p>
          <p><span className="legend-dot unknown"></span> Estado desconocido (gris)</p>
          <p><span className="legend-dot alert"></span> OFF con forecast vencido</p>
        </div>
      </div>
    </div>
  );
}
