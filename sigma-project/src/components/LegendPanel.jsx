// src/components/LegendPanel.jsx

export default function LegendPanel() {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "rgba(17,24,39,0.9)",
        padding: "14px 18px",
        borderRadius: 12,
        color: "white",
        fontSize: 13,
        backdropFilter: "blur(4px)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
        zIndex: 999,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 8, fontSize: 15 }}>
        📡 Leyenda RF
      </h3>

      <div>🟦 <b>Azul:</b> Nodo raíz (Dependencia RF)</div>
      <div>🟧 <b>Naranja:</b> Nivel 1 (riesgo alto)</div>
      <div>🟨 <b>Amarillo:</b> Nivel 2 (riesgo medio)</div>
      <div>⬜ <b>Gris:</b> Niveles ≥3</div>
      <hr style={{ margin: "8px 0", borderColor: "#4b5563" }} />
      <div>🟢 <b>Verde:</b> Nodo ON</div>
      <div>🔴 <b>Rojo:</b> Nodo OFF</div>
      <div>⚠ <b>Rojo + ⚠:</b> OFF con forecast vencido</div>
    </div>
  );
}
