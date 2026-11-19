export function getGraphStats(graph = {}) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
  const edges = Array.isArray(graph.edges) ? graph.edges : []
  const vertexCount = nodes.length
  const edgeCount = edges.length
  if (vertexCount === 0) {
    return {
      vertexCount: 0,
      edgeCount: 0,
      density: 0,
      maxDegree: 0,
      minDegree: 0,
      avgDegree: 0,
      isolatedCount: 0,
    }
  }
  const degreeMap = {}
  for (const node of nodes) {
    degreeMap[String(node.id)] = 0
  }
  if (graph.degrees) {
    for (const [id, deg] of Object.entries(graph.degrees)) {
      degreeMap[String(id)] = deg
    }
  } else {
    for (const edge of edges) {
      const u = String(edge.source)
      const v = String(edge.target)
      if (degreeMap[u] !== undefined) degreeMap[u]++
      if (degreeMap[v] !== undefined) degreeMap[v]++
    }
  }
  const degreeValues = Object.values(degreeMap)
  const maxDegree = Math.max(...degreeValues)
  const minDegree = Math.min(...degreeValues)
  const totalDegree = degreeValues.reduce((sum, d) => sum + d, 0)
  const avgDegree = Number((totalDegree / vertexCount).toFixed(2))
  let density = 0
  if (vertexCount > 1) {
    const possibleEdges = (vertexCount * (vertexCount - 1)) / 2
    density = Number((edgeCount / possibleEdges).toFixed(4))
  }
  const isolatedCount = degreeValues.filter((d) => d === 0).length
  return {
    vertexCount,
    edgeCount,
    density,
    maxDegree,
    minDegree,
    avgDegree,
    isolatedCount,
  }
}
