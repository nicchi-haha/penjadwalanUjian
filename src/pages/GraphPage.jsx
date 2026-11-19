import { useState, useMemo, useRef, useEffect } from 'react'
import useStore from '@/store/useStore'
import { buildGraph } from '@/graph/buildGraph'
import { welshPowell } from '@/graph/welshPowell'
import { getGraphStats } from '@/graph/graphStats'
import { getSlotColor } from '@/utils/demoData'
import {
  Network,
  Info,
  Layers,
  BarChart3,
  ListOrdered,
  Maximize2,
  RefreshCw,
} from 'lucide-react'
export default function GraphPage() {
  const { courses, students, enrollments, slots } = useStore()
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [layoutMode, setLayoutMode] = useState('circle') 
  const { graph, schedulingResult, stats } = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        graph: { nodes: [], edges: [], adjacencyList: {}, degrees: {} },
        schedulingResult: { coloring: {}, chromaticNumber: 0, sortedVertices: [], colorGroups: {}, steps: [] },
        stats: { vertexCount: 0, edgeCount: 0, density: 0, maxDegree: 0, minDegree: 0, avgDegree: 0, isolatedCount: 0 },
      }
    }
    const g = buildGraph(courses, enrollments)
    const res = welshPowell(g)
    const st = getGraphStats(g)
    return {
      graph: g,
      schedulingResult: res,
      stats: st,
    }
  }, [courses, enrollments])
  const courseMap = useMemo(() => {
    return new Map(courses.map((c) => [String(c.id), c]))
  }, [courses])
  const slotMap = useMemo(() => {
    return new Map(slots.map((s) => [Number(s.slotNumber), s]))
  }, [slots])
  const activeFocusId = hoveredNodeId || selectedNodeId
  const n = courses.length
  const W = 640
  const H = 540
  const cx = W / 2
  const cy = H / 2
  const R = Math.min(W, H) / 2 - 64
  const nodeRadius = 26
  const nodePositions = useMemo(() => {
    if (n === 0) return {}
    const pos = {}
    if (layoutMode === 'circle') {
      courses.forEach((c, i) => {
        if (n === 1) {
          pos[String(c.id)] = { x: cx, y: cy }
        } else {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2
          pos[String(c.id)] = {
            x: cx + R * Math.cos(angle),
            y: cy + R * Math.sin(angle),
          }
        }
      })
    } else {
      const colorGroups = schedulingResult.colorGroups || {}
      const groupKeys = Object.keys(colorGroups).map(Number).sort((a, b) => a - b)
      const numGroups = Math.max(1, groupKeys.length)
      const colWidth = (W - 80) / numGroups
      groupKeys.forEach((colorNum, colIdx) => {
        const cIds = colorGroups[colorNum] || []
        const colX = 40 + colIdx * colWidth + colWidth / 2
        const rowHeight = (H - 120) / Math.max(1, cIds.length + 1)
        cIds.forEach((cId, rowIdx) => {
          pos[String(cId)] = {
            x: colX,
            y: 80 + (rowIdx + 1) * rowHeight,
          }
        })
      })
    }
    return pos
  }, [courses, n, layoutMode, schedulingResult.colorGroups])
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center mb-4">
          <Network size={24} className="text-text-muted" strokeWidth={1.6} />
        </div>
        <h2 className="text-base font-semibold mb-1">Graf Belum Tersedia</h2>
        <p className="text-sm text-text-muted max-w-sm mx-auto mb-4">
          Tambahkan data mata kuliah dan mahasiswa di halaman Data untuk menghasilkan visualisasi graf konflik.
        </p>
      </div>
    )
  }
  const focusedCourse = activeFocusId ? courseMap.get(String(activeFocusId)) : null
  const focusedNeighbors = activeFocusId ? graph.adjacencyList[String(activeFocusId)] || [] : []
  const focusedSlot = activeFocusId ? schedulingResult.coloring[String(activeFocusId)] : null
  const focusedSlotInfo = focusedSlot ? slotMap.get(focusedSlot) : null
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Visualisasi Graf Konflik & Pewarnaan</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Simpul adalah mata kuliah. Sisi (garis) berarti ada mahasiswa yang mengambil keduanya (bentrok). Warna simpul adalah nomor slot ujian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLayoutMode(layoutMode === 'circle' ? 'slots' : 'circle')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-text text-xs font-medium hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            Layout: {layoutMode === 'circle' ? 'Melingkar (Circle)' : 'Kelompok Slot (Partisi)'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-surface border border-border rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Simpul |V|</div>
          <div className="text-xl font-bold text-text mt-0.5">{stats.vertexCount} Mata Kuliah</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Sisi Konflik |E|</div>
          <div className="text-xl font-bold text-text mt-0.5">{stats.edgeCount} Pasangan</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Kromatik χ(G)</div>
          <div className="text-xl font-bold text-primary mt-0.5">{schedulingResult.chromaticNumber} Warna</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Derajat Maks Δ(G)</div>
          <div className="text-xl font-bold text-text mt-0.5">{stats.maxDegree} Derajat</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">Densitas Graf</div>
          <div className="text-xl font-bold text-text mt-0.5 font-mono">{(stats.density * 100).toFixed(1)}%</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-text">Kanvas Graf Pewarnaan</h2>
            <span className="text-xs text-text-muted">Klik atau arahkan mouse ke simpul</span>
          </div>
          <div className="bg-surface-alt/40 border border-border rounded-md overflow-hidden relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto select-none"
              style={{ maxHeight: '540px' }}
            >
              {layoutMode === 'slots' && (
                <g className="slot-columns">
                  {Object.keys(schedulingResult.colorGroups).map((colorNum, idx) => {
                    const num = Number(colorNum)
                    const numGroups = Object.keys(schedulingResult.colorGroups).length
                    const colWidth = (W - 80) / numGroups
                    const colX = 40 + idx * colWidth
                    const col = getSlotColor(num)
                    return (
                      <g key={num}>
                        <rect
                          x={colX + 4}
                          y={16}
                          width={colWidth - 8}
                          height={H - 32}
                          rx={8}
                          fill="var(--color-surface)"
                          stroke="var(--color-border)"
                          strokeWidth={1}
                          strokeDasharray="4 3"
                          opacity={0.7}
                        />
                        <text
                          x={colX + colWidth / 2}
                          y={42}
                          textAnchor="middle"
                          fill="var(--color-text)"
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="var(--font-mono)"
                        >
                          Slot {num}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )}
              {graph.edges.map((edge) => {
                const p1 = nodePositions[edge.source]
                const p2 = nodePositions[edge.target]
                if (!p1 || !p2) return null
                const isConnectedToFocus =
                  activeFocusId &&
                  (String(edge.source) === String(activeFocusId) || String(edge.target) === String(activeFocusId))
                const isDimmed = activeFocusId && !isConnectedToFocus
                return (
                  <line
                    key={edge.id}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isConnectedToFocus ? 'var(--color-text)' : 'var(--color-border-strong)'}
                    strokeWidth={isConnectedToFocus ? 2.5 : 1.5}
                    strokeOpacity={isDimmed ? 0.15 : isConnectedToFocus ? 1 : 0.6}
                    strokeDasharray={isConnectedToFocus ? 'none' : 'none'}
                    className="transition-all duration-150"
                  >
                    <title>
                      Bentrok: {edge.source} & {edge.target} ({edge.weight} mahasiswa)
                    </title>
                  </line>
                )
              })}
              {courses.map((course) => {
                const cId = String(course.id)
                const pos = nodePositions[cId]
                if (!pos) return null
                const assignedColorNum = schedulingResult.coloring[cId] || 1
                const color = getSlotColor(assignedColorNum)
                const isFocused = activeFocusId && String(activeFocusId) === cId
                const isNeighbor =
                  activeFocusId &&
                  (graph.adjacencyList[String(activeFocusId)] || []).includes(cId)
                const isDimmed = activeFocusId && !isFocused && !isNeighbor
                const kode = course.kode || course.courseCode || cId
                return (
                  <g
                    key={cId}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer transition-all duration-150"
                    opacity={isDimmed ? 0.2 : 1}
                    onMouseEnter={() => setHoveredNodeId(cId)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => setSelectedNodeId(selectedNodeId === cId ? null : cId)}
                  >
                    {isFocused && (
                      <circle
                        r={nodeRadius + 6}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth={3}
                        strokeDasharray="4 2"
                      />
                    )}
                    <circle
                      r={nodeRadius}
                      fill={color.bg}
                      stroke="var(--color-surface)"
                      strokeWidth={3}
                      className="shadow-sm"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={color.text}
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                    >
                      {kode.length > 5 ? kode.slice(0, 5) : kode}
                    </text>
                    <g transform={`translate(${nodeRadius - 8}, ${-(nodeRadius - 8)})`}>
                      <circle r={9} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1.5} />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--color-text)"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="var(--font-mono)"
                      >
                        {assignedColorNum}
                      </text>
                    </g>
                    <title>{`${kode} - ${course.nama || course.courseName} (Slot ${assignedColorNum})`}</title>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="p-3.5 bg-surface border border-border rounded-md text-xs space-y-1 min-h-[56px] flex items-center">
            {focusedCourse ? (
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text text-sm">
                    {focusedCourse.kode || focusedCourse.courseCode}
                  </span>
                  <span className="text-text-secondary font-medium truncate">
                    {focusedCourse.nama || focusedCourse.courseName}
                  </span>
                  <span
                    className="ml-auto px-2 py-0.5 rounded text-[10.5px] font-mono font-bold"
                    style={{
                      backgroundColor: getSlotColor(focusedSlot).bg,
                      color: getSlotColor(focusedSlot).text,
                    }}
                  >
                    Slot {focusedSlot} ({focusedSlotInfo ? focusedSlotInfo.label : `Sesi ${focusedSlot}`})
                  </span>
                </div>
                <div className="text-text-muted mt-1">
                  {focusedNeighbors.length > 0 ? (
                    <span>
                      Bentrok dengan <strong className="text-text">{focusedNeighbors.length}</strong> mata kuliah:{' '}
                      <span className="font-mono text-text">
                        {focusedNeighbors
                          .map((nId) => {
                            const c = courseMap.get(String(nId))
                            return c ? c.kode || c.courseCode : nId
                          })
                          .join(', ')}
                      </span>
                    </span>
                  ) : (
                    <span className="text-success font-medium">Mata kuliah ini bebas dari bentrok (Derajat = 0).</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-text-muted flex items-center gap-2">
                <Info size={15} />
                <span>Arahkan kursor atau klik simpul untuk memeriksa relasi konflik dan jadwal sesi ujiannya.</span>
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
              Keterangan Warna Slot Ujian:
            </div>
            <div className="flex flex-wrap gap-2.5">
              {Object.keys(schedulingResult.colorGroups).map((colorNum) => {
                const num = Number(colorNum)
                const col = getSlotColor(num)
                const slotInfo = slotMap.get(num)
                const coursesInSlot = schedulingResult.colorGroups[colorNum] || []
                return (
                  <div
                    key={num}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-xs"
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.bg }} />
                    <span className="font-mono font-semibold text-text">Slot {num}</span>
                    <span className="text-text-muted">
                      ({coursesInSlot.length} MK · {slotInfo ? slotInfo.day : `Hari ${num}`})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        <section className="lg:col-span-4 bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <ListOrdered size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-text">Log Algoritma Welsh-Powell</h2>
          </div>
          <p className="text-xs text-text-secondary">
            Catatan keputusan algoritma saat menentukan warna tiap simpul dalam setiap putaran.
          </p>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {schedulingResult.steps.map((step, idx) => {
              const course = courseMap.get(String(step.vertexId))
              const col = getSlotColor(step.color)
              const isColored = step.action === 'colored'
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-md border text-xs transition-colors ${
                    isColored
                      ? 'bg-surface border-border hover:bg-surface-alt/40'
                      : 'bg-surface-alt/30 border-border/70 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-mono font-semibold text-text">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: col.bg }}
                      />
                      <span>{course ? course.kode || course.courseCode : step.vertexId}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                        isColored ? 'bg-success/15 text-success' : 'bg-text-muted/15 text-text-muted'
                      }`}
                    >
                      {isColored ? `Diberi Slot ${step.color}` : 'Dilewati'}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-text-secondary leading-relaxed">
                    {step.reason}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
