import { useState, useMemo } from 'react'
import useStore from '@/store/useStore'
import { buildGraph } from '@/graph/buildGraph'
import { welshPowell } from '@/graph/welshPowell'
import { validateColoring } from '@/graph/validateColoring'
import { getSlotColor } from '@/utils/demoData'
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Table as TableIcon,
  UserCheck,
  Search,
} from 'lucide-react'
export default function SchedulePage() {
  const { courses, students, enrollments, slots } = useStore()
  const [activeTab, setActiveTab] = useState('slots') 
  const [studentSearch, setStudentSearch] = useState('')
  const { graph, schedulingResult, validation } = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        graph: { nodes: [], edges: [], adjacencyList: {}, degrees: {} },
        schedulingResult: { coloring: {}, chromaticNumber: 0, sortedVertices: [], colorGroups: {}, steps: [] },
        validation: { isValid: true, conflicts: [] },
      }
    }
    const g = buildGraph(courses, enrollments)
    const result = welshPowell(g)
    const valid = validateColoring(g, result.coloring)
    return {
      graph: g,
      schedulingResult: result,
      validation: valid,
    }
  }, [courses, enrollments])
  const courseMap = useMemo(() => {
    return new Map(courses.map((c) => [String(c.id), c]))
  }, [courses])
  const slotMap = useMemo(() => {
    return new Map(slots.map((s) => [Number(s.slotNumber), s]))
  }, [slots])
  const enrolledCount = (courseId) => {
    return students.filter((s) => Array.isArray(s.mk) && s.mk.some((m) => String(m) === String(courseId))).length
  }
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center mb-4">
          <CalendarDays size={24} className="text-text-muted" strokeWidth={1.6} />
        </div>
        <h2 className="text-base font-semibold mb-1">Belum Ada Data Mata Kuliah</h2>
        <p className="text-sm text-text-muted max-w-sm mx-auto mb-4">
          Tambahkan data mata kuliah dan mahasiswa di halaman Data terlebih dahulu untuk menghasilkan jadwal.
        </p>
      </div>
    )
  }
  const { chromaticNumber, colorGroups, sortedVertices, steps } = schedulingResult
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-text">Jadwal Ujian (Welsh-Powell)</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Hasil optimasi jadwal ujian otomatis. Mata kuliah pada slot yang sama dijamin bebas bentrok.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-text-muted">Slot Dibutuhkan</div>
          <div className="text-2xl font-bold text-text mt-1">{chromaticNumber} Sesi</div>
          <div className="text-xs text-text-secondary mt-0.5 font-mono">Bilangan Kromatik χ(G)</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-text-muted">Status Validasi</div>
          <div className="flex items-center gap-1.5 text-base font-bold text-success mt-1">
            <CheckCircle2 size={18} />
            <span>{validation.isValid ? 'Bebas Bentrok' : 'Ada Konflik'}</span>
          </div>
          <div className="text-xs text-text-secondary mt-0.5">0 Mahasiswa Tabrakan</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-text-muted">Mata Kuliah</div>
          <div className="text-2xl font-bold text-text mt-1">{courses.length} MK</div>
          <div className="text-xs text-text-secondary mt-0.5">{graph.edges.length} Pasang Konflik</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-semibold text-text-muted">Peserta Ujian</div>
          <div className="text-2xl font-bold text-text mt-1">{students.length} Mahasiswa</div>
          <div className="text-xs text-text-secondary mt-0.5">{enrollments.length} Total Pengambilan</div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'slots'
              ? 'border-primary text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Layers size={14} />
          Daftar Sesi Ujian (Slot Cards)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('trace')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'trace'
              ? 'border-primary text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <TableIcon size={14} />
          Tabel Langkah Welsh-Powell (Trace)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'students'
              ? 'border-primary text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <UserCheck size={14} />
          Jadwal Per Mahasiswa
        </button>
      </div>
      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(colorGroups).map(([colorNum, courseIds]) => {
            const slotNumber = Number(colorNum)
            const color = getSlotColor(slotNumber)
            const slotInfo = slotMap.get(slotNumber)
            const totalSlotParticipants = courseIds.reduce((sum, id) => sum + enrolledCount(id), 0)
            return (
              <div
                key={slotNumber}
                className="bg-surface border border-border rounded-lg overflow-hidden shadow-xs"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-alt/40">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.bg }}
                    />
                    <div>
                      <span className="font-semibold text-text text-sm font-mono mr-2">
                        Slot {slotNumber}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {slotInfo ? slotInfo.label : `Sesi Tambahan ${slotNumber}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-text-muted tabular-nums">
                    {totalSlotParticipants} peserta
                  </span>
                </div>
                <ul className="divide-y divide-border p-0 m-0">
                  {courseIds.map((cId) => {
                    const course = courseMap.get(String(cId))
                    if (!course) return null
                    const count = enrolledCount(course.id)
                    return (
                      <li key={course.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-surface-alt/30 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="font-mono font-semibold text-xs text-text bg-surface-alt px-1.5 py-0.5 rounded border border-border">
                            {course.kode || course.courseCode}
                          </span>
                          <span className="text-xs font-medium text-text truncate">
                            {course.nama || course.courseName}
                          </span>
                        </div>
                        <span className="text-xs text-text-secondary whitespace-nowrap tabular-nums">
                          {count} mhs
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
      {activeTab === 'trace' && (
        <div className="bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-text">Tabel Urutan Derajat & Langkah Pewarnaan</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Simpul diurutkan berdasarkan derajat keterhubungan terbesar ke terkecil. Simpul yang tidak bertetangga dengan warna sama dapat diuji bersamaan.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-2 px-3 text-center">Urutan</th>
                  <th className="py-2 px-3">Mata Kuliah</th>
                  <th className="py-2 px-3 text-center">Derajat (d)</th>
                  <th className="py-2 px-3">Mata Kuliah Bentrok (Tetangga)</th>
                  <th className="py-2 px-3 text-center">Slot / Warna</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedVertices.map((v, index) => {
                  const course = courseMap.get(String(v.id))
                  const assignedColor = schedulingResult.coloring[v.id]
                  const col = getSlotColor(assignedColor)
                  const neighborIds = graph.adjacencyList[v.id] || []
                  const neighborCodes = neighborIds
                    .map((nId) => {
                      const c = courseMap.get(String(nId))
                      return c ? c.kode || c.courseCode : nId
                    })
                    .sort()
                  return (
                    <tr key={v.id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-text-muted">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-semibold text-text mr-2">
                          {course ? course.kode || course.courseCode : v.id}
                        </span>
                        <span className="text-text-secondary">{course ? course.nama || course.courseName : ''}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-text">
                        {v.degree}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {neighborCodes.length === 0 ? (
                            <span className="text-text-muted">-</span>
                          ) : (
                            neighborCodes.map((code) => (
                              <span
                                key={code}
                                className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-surface-alt border border-border text-text-secondary"
                              >
                                {code}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold"
                          style={{
                            backgroundColor: col.bg,
                            color: col.text,
                          }}
                        >
                          Slot {assignedColor}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'students' && (
        <div className="bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Rekap Jadwal Tiap Mahasiswa</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Periksa jadwal perorangan untuk membuktikan tidak ada jadwal ujian mahasiswa yang tabrakan.
              </p>
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-2.5 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Cari NIM atau nama..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-2 px-3">NIM</th>
                  <th className="py-2 px-3">Nama</th>
                  <th className="py-2 px-3">Jadwal Ujian Mata Kuliah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students
                  .filter((s) => {
                    const query = studentSearch.toLowerCase()
                    const nim = (s.nim || s.studentNumber || '').toLowerCase()
                    const name = (s.nama || s.fullName || '').toLowerCase()
                    return nim.includes(query) || name.includes(query)
                  })
                  .map((s) => {
                    const studentCourses = (s.mk || []).map((id) => {
                      const c = courseMap.get(String(id))
                      const slotNum = schedulingResult.coloring[String(id)]
                      const slotInfo = slotMap.get(slotNum)
                      const col = getSlotColor(slotNum)
                      return {
                        course: c,
                        slotNum,
                        slotLabel: slotInfo ? slotInfo.label : `Slot ${slotNum}`,
                        color: col,
                      }
                    })
                    return (
                      <tr key={s.id} className="hover:bg-surface-alt/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-text">{s.nim || s.studentNumber}</td>
                        <td className="py-3 px-3 font-medium text-text">{s.nama || s.fullName}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-2">
                            {studentCourses.map((sc, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-border text-xs"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: sc.color.bg }}
                                />
                                <span className="font-mono font-semibold text-text">
                                  {sc.course ? sc.course.kode || sc.course.courseCode : ''}
                                </span>
                                <span className="text-text-secondary">({sc.slotLabel})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
