export function validateColoring(graph = {}, coloring = {}) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
  const edges = Array.isArray(graph.edges) ? graph.edges : []
  const conflicts = []
  const uncoloredNodes = []
  const usedColors = new Set()
  for (const node of nodes) {
    const id = String(node.id)
    const color = coloring[id]
    if (color === undefined || color === null) {
      uncoloredNodes.push(id)
    } else {
      usedColors.add(color)
    }
  }
  for (const edge of edges) {
    const u = String(edge.source)
    const v = String(edge.target)
    const colorU = coloring[u]
    const colorV = coloring[v]
    if (colorU !== undefined && colorV !== undefined && colorU === colorV) {
      conflicts.push({
        source: u,
        target: v,
        color: colorU,
      })
    }
  }
  const isValid = conflicts.length === 0 && uncoloredNodes.length === 0
  return {
    isValid,
    conflicts,
    uncoloredNodes,
    coloredCount: nodes.length - uncoloredNodes.length,
    totalNodes: nodes.length,
    chromaticNumber: usedColors.size,
  }
}
