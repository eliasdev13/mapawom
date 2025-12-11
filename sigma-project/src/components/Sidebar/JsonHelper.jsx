// src/components/Sidebar/JsonHelper.jsx

export default function JsonHelper() {
  return (
    <div
      style={{
        background: "#2e1065",
        padding: "12px",
        borderRadius: 8,
        marginTop: 10,
        color: "#e9d5ff",
        fontSize: 13,
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
      }}
    >
{`{
  "nodes": [
    {
      "id": "A001",
      "tipo": "Access | Hub | Backhaul",
      "estado": "ON | OFF",
      "lat": -33.441,
      "lng": -70.634,
      "forecast": "2025-04-10 | null"
    }
  ],
  "edges": [
    { "source": "A001", "target": "A002" }
  ]
}`}
    </div>
  );
}
