export function buildGraph(courses = [], enrollments = []) {
  const nodes = courses.map((course) => ({
    ...course,
    id: String(course.id),
  }))
  const nodeMap = new Map()
  const adjacencyMap = new Map()
  const degrees = {}
  for (const node of nodes) {
    nodeMap.set(node.id, node)
    adjacencyMap.set(node.id, new Set())
    degrees[node.id] = 0
  }
  const studentCourses = new Map()
  for (const item of enrollments) {
    if (!item) continue
    if (item.studentId !== undefined && item.courseId !== undefined) {
      const studentId = String(item.studentId)
      const courseId = String(item.courseId)
      if (!nodeMap.has(courseId)) continue
      if (!studentCourses.has(studentId)) {
        studentCourses.set(studentId, new Set())
      }
      studentCourses.get(studentId).add(courseId)
    }
    else if (item.id !== undefined && Array.isArray(item.mk)) {
      const studentId = String(item.id)
      for (const rawCourseId of item.mk) {
        const courseId = String(rawCourseId)
        if (!nodeMap.has(courseId)) continue
        if (!studentCourses.has(studentId)) {
          studentCourses.set(studentId, new Set())
        }
        studentCourses.get(studentId).add(courseId)
      }
    }
  }
  const edgeMap = new Map()
  for (const [studentId, courseSet] of studentCourses.entries()) {
    const courseList = Array.from(courseSet)
    const len = courseList.length
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const u = courseList[i]
        const v = courseList[j]
        const edgeKey = u < v ? `${u}--${v}` : `${v}--${u}`
        if (!edgeMap.has(edgeKey)) {
          const [source, target] = u < v ? [u, v] : [v, u]
          edgeMap.set(edgeKey, {
            id: edgeKey,
            source,
            target,
            weight: 0,
            studentIds: [],
          })
        }
        const edge = edgeMap.get(edgeKey)
        edge.weight += 1
        edge.studentIds.push(studentId)
        adjacencyMap.get(u).add(v)
        adjacencyMap.get(v).add(u)
      }
    }
  }
  const adjacencyList = {}
  for (const [nodeId, neighbors] of adjacencyMap.entries()) {
    const neighborArray = Array.from(neighbors).sort()
    adjacencyList[nodeId] = neighborArray
    degrees[nodeId] = neighborArray.length
  }
  const edges = Array.from(edgeMap.values())
  return {
    nodes,
    edges,
    adjacencyList,
    degrees,
  }
}
