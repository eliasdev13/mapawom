// src/components/TelecomPanel.jsx

export default function TelecomPanel({ sidebar, graph }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {sidebar}

      <div style={{ flex: 1, background: "#ffffff" }}>{graph}</div>
    </div>
  );
}
