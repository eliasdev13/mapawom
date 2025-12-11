// ============================================================
// VALIDACIÓN PROFESIONAL DE RED RF (WOM)
// Detecta errores comunes en JSON antes de cargarlo al mapa
// ============================================================

export function validateNetworkJSON(json) {
  const errors = [];

  // -------------------------------
  // VALIDAR ESTRUCTURA BÁSICA
  // -------------------------------
  if (!json || typeof json !== "object") {
    errors.push("El archivo no contiene un JSON válido.");
    return errors;
  }

  if (!Array.isArray(json.nodes)) {
    errors.push("El JSON debe contener un arreglo 'nodes'.");
  }
  if (!Array.isArray(json.edges)) {
    errors.push("El JSON debe contener un arreglo 'edges'.");
  }

  if (errors.length) return errors;

  const nodes = json.nodes;
  const edges = json.edges;

  // -------------------------------
  // MAPA PARA CONTROLAR DUPLICADOS
  // -------------------------------
  const idSet = new Set();

  // -------------------------------
  // VALIDAR NODOS
  // -------------------------------
  nodes.forEach((n, idx) => {
    if (!n.id) errors.push(`Nodo en posición ${idx} no tiene 'id'.`);

    // id duplicado
    if (idSet.has(n.id)) {
      errors.push(`El nodo '${n.id}' está duplicado.`);
    } else {
      idSet.add(n.id);
    }

    // tipo
    const tiposValidos = ["Access", "Hub"];
    if (!tiposValidos.includes(n.tipo)) {
      errors.push(`Nodo '${n.id}' tiene tipo inválido: ${n.tipo}`);
    }

    // estado
    const estadosValidos = ["ON", "ON-AIR", "OFF", "DESCONOCIDO"];
    if (!estadosValidos.includes(n.estado)) {
      errors.push(`Nodo '${n.id}' tiene estado inválido: ${n.estado}`);
    }

    // forecast fecha válida
    if (n.forecast) {
      const d = new Date(n.forecast);
      if (isNaN(d.getTime())) {
        errors.push(`Nodo '${n.id}' tiene un forecast inválido: ${n.forecast}`);
      }
    }

    // lat/lng si existen deben ser numéricos
    if (n.lat !== undefined && typeof n.lat !== "number") {
      errors.push(`Nodo '${n.id}' tiene 'lat' no numérico.`);
    }
    if (n.lng !== undefined && typeof n.lng !== "number") {
      errors.push(`Nodo '${n.id}' tiene 'lng' no numérico.`);
    }
  });

  // -------------------------------
  // VALIDAR EDGES
  // -------------------------------
  edges.forEach((e, idx) => {
    if (!e.source || !e.target) {
      errors.push(`Edge en posición ${idx} no tiene source/target.`);
      return;
    }

    if (!idSet.has(e.source)) {
      errors.push(`Edge ${idx}: nodo source '${e.source}' no existe.`);
    }
    if (!idSet.has(e.target)) {
      errors.push(`Edge ${idx}: nodo target '${e.target}' no existe.`);
    }

    if (e.source === e.target) {
      errors.push(`Edge ${idx} conecta un nodo consigo mismo (${e.source}).`);
    }
  });

  return errors;
}
