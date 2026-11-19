import { describe, it, expect } from 'vitest'
import { buildGraph } from './buildGraph'
import { welshPowell } from './welshPowell'
import { validateColoring } from './validateColoring'
import { getGraphStats } from './graphStats'
describe('Graph Module: buildGraph', () => {
  it('creates conflict edges when students share courses', () => {
    const courses = [
      { id: 'IF101', courseName: 'Matematika Diskrit' },
      { id: 'IF102', courseName: 'Struktur Data' },
      { id: 'IF103', courseName: 'Algoritma Pemrograman' },
    ]
    const enrollments = [
      { studentId: 'M01', courseId: 'IF101' },
      { studentId: 'M01', courseId: 'IF102' },
      { studentId: 'M02', courseId: 'IF102' },
      { studentId: 'M02', courseId: 'IF103' },
    ]
    const graph = buildGraph(courses, enrollments)
    expect(graph.nodes).toHaveLength(3)
    expect(graph.edges).toHaveLength(2)
    expect(graph.degrees['IF102']).toBe(2)
    expect(graph.degrees['IF101']).toBe(1)
    expect(graph.degrees['IF103']).toBe(1)
    expect(graph.adjacencyList['IF102']).toEqual(['IF101', 'IF103'])
  })
  it('handles empty input gracefully', () => {
    const graph = buildGraph([], [])
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
    expect(graph.degrees).toEqual({})
  })
})
describe('Graph Module: welshPowell Algorithm', () => {
  it('colors a triangle graph (K3) with 3 colors', () => {
    const graph = {
      nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      edges: [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'A', target: 'C' },
      ],
    }
    const result = welshPowell(graph)
    expect(result.chromaticNumber).toBe(3)
    expect(result.coloring['A']).not.toBe(result.coloring['B'])
    expect(result.coloring['B']).not.toBe(result.coloring['C'])
    expect(result.coloring['A']).not.toBe(result.coloring['C'])
    const validation = validateColoring(graph, result.coloring)
    expect(validation.isValid).toBe(true)
    expect(validation.conflicts).toHaveLength(0)
  })
  it('colors a cycle C4 (bipartite) with 2 colors', () => {
    const graph = {
      nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
      edges: [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'C', target: 'D' },
        { source: 'D', target: 'A' },
      ],
    }
    const result = welshPowell(graph)
    expect(result.chromaticNumber).toBe(2)
    expect(result.coloring['A']).toBe(result.coloring['C'])
    expect(result.coloring['B']).toBe(result.coloring['D'])
    expect(result.coloring['A']).not.toBe(result.coloring['B'])
    const validation = validateColoring(graph, result.coloring)
    expect(validation.isValid).toBe(true)
  })
  it('sorts vertices in descending order of degree', () => {
    const graph = {
      nodes: [
        { id: 'L1' },
        { id: 'L2' },
        { id: 'H' },
        { id: 'L3' },
        { id: 'L4' },
      ],
      edges: [
        { source: 'H', target: 'L1' },
        { source: 'H', target: 'L2' },
        { source: 'H', target: 'L3' },
        { source: 'H', target: 'L4' },
      ],
    }
    const result = welshPowell(graph)
    expect(result.sortedVertices[0].id).toBe('H')
    expect(result.sortedVertices[0].degree).toBe(4)
    expect(result.chromaticNumber).toBe(2)
    expect(result.coloring['H']).toBe(1)
    expect(result.coloring['L1']).toBe(2)
    expect(result.coloring['L2']).toBe(2)
    expect(result.coloring['L3']).toBe(2)
    expect(result.coloring['L4']).toBe(2)
  })
  it('records detailed explanation steps', () => {
    const graph = {
      nodes: [{ id: 'A' }, { id: 'B' }],
      edges: [{ source: 'A', target: 'B' }],
    }
    const result = welshPowell(graph)
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0]).toHaveProperty('action')
    expect(result.steps[0]).toHaveProperty('reason')
  })
  it('handles isolated nodes by grouping them in color 1', () => {
    const graph = {
      nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      edges: [],
    }
    const result = welshPowell(graph)
    expect(result.chromaticNumber).toBe(1)
    expect(result.coloring['A']).toBe(1)
    expect(result.coloring['B']).toBe(1)
    expect(result.coloring['C']).toBe(1)
  })
})
describe('Graph Module: validateColoring', () => {
  it('detects adjacent vertices with identical colors', () => {
    const graph = {
      nodes: [{ id: 'A' }, { id: 'B' }],
      edges: [{ source: 'A', target: 'B' }],
    }
    const invalidColoring = { A: 1, B: 1 }
    const result = validateColoring(graph, invalidColoring)
    expect(result.isValid).toBe(false)
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0].source).toBe('A')
    expect(result.conflicts[0].target).toBe('B')
  })
  it('detects uncolored nodes', () => {
    const graph = {
      nodes: [{ id: 'A' }, { id: 'B' }],
      edges: [],
    }
    const incompleteColoring = { A: 1 }
    const result = validateColoring(graph, incompleteColoring)
    expect(result.isValid).toBe(false)
    expect(result.uncoloredNodes).toContain('B')
  })
})
describe('Graph Module: getGraphStats', () => {
  it('computes correct metrics for complete graph K4', () => {
    const graph = {
      nodes: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
      edges: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '1', target: '4' },
        { source: '2', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '4' },
      ],
    }
    const stats = getGraphStats(graph)
    expect(stats.vertexCount).toBe(4)
    expect(stats.edgeCount).toBe(6)
    expect(stats.density).toBe(1) 
    expect(stats.maxDegree).toBe(3)
    expect(stats.minDegree).toBe(3)
    expect(stats.avgDegree).toBe(3)
    expect(stats.isolatedCount).toBe(0)
  })
})
describe('Integration: Input Data & Graph Scheduling', () => {
  it('reads demo data, builds conflict graph, and produces valid Welsh-Powell schedule', async () => {
    const { demoCourses, demoStudents } = await import('../utils/demoData')
    const graph = buildGraph(demoCourses, demoStudents)
    expect(graph.nodes).toHaveLength(8)
    expect(graph.edges.length).toBeGreaterThan(0)
    const result = welshPowell(graph)
    expect(result.chromaticNumber).toBeGreaterThan(0)
    expect(Object.keys(result.coloring)).toHaveLength(8)
    const validation = validateColoring(graph, result.coloring)
    expect(validation.isValid).toBe(true)
    expect(validation.conflicts).toHaveLength(0)
    expect(validation.uncoloredNodes).toHaveLength(0)
  })
})
