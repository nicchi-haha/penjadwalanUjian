export function welshPowell(graph = {}) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
  const edges = Array.isArray(graph.edges) ? graph.edges : []
  if (nodes.length === 0) {
    return {
      coloring: {},
      chromaticNumber: 0,
      sortedVertices: [],
      colorGroups: {},
      steps: [],
    }
  }
  const adjMap = new Map()
  for (const node of nodes) {
    const id = String(node.id)
    adjMap.set(id, new Set())
  }
  if (graph.adjacencyList) {
    for (const [nodeId, neighbors] of Object.entries(graph.adjacencyList)) {
      const id = String(nodeId)
      if (!adjMap.has(id)) adjMap.set(id, new Set())
      for (const n of neighbors) {
        adjMap.get(id).add(String(n))
      }
    }
  } else {
    for (const edge of edges) {
      const u = String(edge.source)
      const v = String(edge.target)
      if (adjMap.has(u) && adjMap.has(v)) {
        adjMap.get(u).add(v)
        adjMap.get(v).add(u)
      }
    }
  }
  const sortedVertices = nodes.map((node) => {
    const id = String(node.id)
    const degree = graph.degrees?.[id] ?? (adjMap.get(id)?.size || 0)
    return {
      ...node,
      id,
      degree,
    }
  })
  sortedVertices.sort((a, b) => {
    if (b.degree !== a.degree) {
      return b.degree - a.degree
    }
    return a.id.localeCompare(b.id)
  })
  const coloring = {}
  const colorGroups = {}
  const steps = []
  let uncoloredCount = sortedVertices.length
  let currentColor = 1
  let stepIndex = 1
  while (uncoloredCount > 0) {
    const currentRoundVertices = []
    colorGroups[currentColor] = []
    for (const vertex of sortedVertices) {
      const vId = vertex.id
      if (coloring[vId] !== undefined) {
        continue
      }
      const vNeighbors = adjMap.get(vId) || new Set()
      const conflictingNeighbors = currentRoundVertices.filter((coloredId) =>
        vNeighbors.has(coloredId),
      )
      if (conflictingNeighbors.length === 0) {
        coloring[vId] = currentColor
        currentRoundVertices.push(vId)
        colorGroups[currentColor].push(vId)
        uncoloredCount--
        steps.push({
          stepIndex: stepIndex++,
          round: currentColor,
          color: currentColor,
          vertexId: vId,
          action: 'colored',
          reason:
            currentRoundVertices.length === 1
              ? `Simpul derajat tertinggi yang belum diwarnai pada putaran ${currentColor}`
              : `Tidak bertetangga dengan simpul lain yang berwarna ${currentColor}`,
        })
      } else {
        steps.push({
          stepIndex: stepIndex++,
          round: currentColor,
          color: currentColor,
          vertexId: vId,
          action: 'skipped',
          reason: `Bertetangga dengan simpul [${conflictingNeighbors.join(', ')}] yang sudah diberi warna ${currentColor}`,
          conflictingWith: conflictingNeighbors,
        })
      }
    }
    currentColor++
  }
  const chromaticNumber = Object.keys(colorGroups).length
  return {
    coloring,
    chromaticNumber,
    sortedVertices,
    colorGroups,
    steps,
  }
}
