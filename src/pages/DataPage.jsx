import { useState, useId } from 'react'
import useStore from '@/store/useStore'
import { BookOpen, Users, RotateCcw, Trash2, Edit2, AlertCircle } from 'lucide-react'
export default function DataPage() {
  const { courses, students, setCourses, setStudents, resetToDemo, clearAll } = useStore()
  const [mkKode, setMkKode] = useState('')
  const [mkNama, setMkNama] = useState('')
  const [editMkId, setEditMkId] = useState(null)
  const [mkError, setMkError] = useState('')
  const [mhsNim, setMhsNim] = useState('')
  const [mhsNama, setMhsNama] = useState('')
  const [mhsDraftMk, setMhsDraftMk] = useState(new Set())
  const [editMhsId, setEditMhsId] = useState(null)
  const [mhsError, setMhsError] = useState('')
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const getEnrolledCount = (courseId) => {
    return students.filter((s) => Array.isArray(s.mk) && s.mk.some((m) => String(m) === String(courseId))).length
  }
  const resetMkForm = () => {
    setEditMkId(null)
    setMkKode('')
    setMkNama('')
    setMkError('')
  }
  const handleMkSubmit = (e) => {
    e.preventDefault()
    const kode = mkKode.trim().toUpperCase()
    const nama = mkNama.trim()
    if (!kode || !nama) {
      setMkError('Kode dan nama mata kuliah wajib diisi.')
      return
    }
    const duplicate = courses.some(
      (c) => (c.kode === kode || c.courseCode === kode) && String(c.id) !== String(editMkId),
    )
    if (duplicate) {
      setMkError(`Kode ${kode} sudah dipakai.`)
      return
    }
    if (editMkId !== null) {
      const updated = courses.map((c) =>
        String(c.id) === String(editMkId)
          ? { ...c, kode, nama, courseCode: kode, courseName: nama }
          : c,
      )
      setCourses(updated)
    } else {
      const nextId = courses.length > 0 ? Math.max(...courses.map((c) => Number(c.id) || 0)) + 1 : 1
      const newCourse = {
        id: nextId,
        kode,
        nama,
        courseCode: kode,
        courseName: nama,
      }
      setCourses([...courses, newCourse])
    }
    resetMkForm()
  }
  const handleEditMk = (course) => {
    setEditMkId(course.id)
    setMkKode(course.kode || course.courseCode || '')
    setMkNama(course.nama || course.courseName || '')
    setMkError('')
  }
  const handleDeleteMk = (courseId) => {
    if (pendingConfirm !== `mk:${courseId}`) {
      setPendingConfirm(`mk:${courseId}`)
      return
    }
    setPendingConfirm(null)
    const updatedCourses = courses.filter((c) => String(c.id) !== String(courseId))
    const updatedStudents = students.map((s) => ({
      ...s,
      mk: (s.mk || []).filter((m) => String(m) !== String(courseId)),
    }))
    setCourses(updatedCourses)
    setStudents(updatedStudents)
    if (String(editMkId) === String(courseId)) {
      resetMkForm()
    }
  }
  const resetMhsForm = () => {
    setEditMhsId(null)
    setMhsNim('')
    setMhsNama('')
    setMhsDraftMk(new Set())
    setMhsError('')
  }
  const handleMhsSubmit = (e) => {
    e.preventDefault()
    const nim = mhsNim.trim()
    const nama = mhsNama.trim()
    if (!nim || !nama) {
      setMhsError('NIM dan nama mahasiswa wajib diisi.')
      return
    }
    const duplicate = students.some(
      (s) => (s.nim === nim || s.studentNumber === nim) && String(s.id) !== String(editMhsId),
    )
    if (duplicate) {
      setMhsError(`NIM ${nim} sudah terdaftar.`)
      return
    }
    const validMkIds = Array.from(mhsDraftMk).filter((id) =>
      courses.some((c) => String(c.id) === String(id)),
    )
    if (editMhsId !== null) {
      const updated = students.map((s) =>
        String(s.id) === String(editMhsId)
          ? { ...s, nim, nama, studentNumber: nim, fullName: nama, mk: validMkIds }
          : s,
      )
      setStudents(updated)
    } else {
      const nextId = students.length > 0 ? Math.max(...students.map((s) => Number(s.id) || 0)) + 1 : 1
      const newStudent = {
        id: nextId,
        nim,
        nama,
        studentNumber: nim,
        fullName: nama,
        mk: validMkIds,
      }
      setStudents([...students, newStudent])
    }
    resetMhsForm()
  }
  const handleEditMhs = (student) => {
    setEditMhsId(student.id)
    setMhsNim(student.nim || student.studentNumber || '')
    setMhsNama(student.nama || student.fullName || '')
    setMhsDraftMk(new Set((student.mk || []).map((id) => Number(id) || id)))
    setMhsError('')
  }
  const handleDeleteMhs = (studentId) => {
    if (pendingConfirm !== `mhs:${studentId}`) {
      setPendingConfirm(`mhs:${studentId}`)
      return
    }
    setPendingConfirm(null)
    const updated = students.filter((s) => String(s.id) !== String(studentId))
    setStudents(updated)
    if (String(editMhsId) === String(studentId)) {
      resetMhsForm()
    }
  }
  const toggleCourseEnrollment = (courseId) => {
    setMhsDraftMk((prev) => {
      const next = new Set(prev)
      const numericId = Number(courseId)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else if (next.has(numericId)) {
        next.delete(numericId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }
  const handleResetToDemo = () => {
    if (pendingConfirm !== 'reset') {
      setPendingConfirm('reset')
      return
    }
    setPendingConfirm(null)
    resetToDemo()
    resetMkForm()
    resetMhsForm()
  }
  const handleClearAll = () => {
    if (pendingConfirm !== 'clear') {
      setPendingConfirm('clear')
      return
    }
    setPendingConfirm(null)
    clearAll()
    resetMkForm()
    resetMhsForm()
  }
  const courseById = new Map(courses.map((c) => [String(c.id), c]))
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Input & Kelola Data</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Kelola data master mata kuliah dan mahasiswa untuk penyusunan jadwal ujian otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDemo}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
              pendingConfirm === 'reset'
                ? 'bg-destructive text-white border-destructive'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-alt hover:text-text'
            }`}
          >
            {pendingConfirm === 'reset' ? 'Yakin kembalikan data?' : 'Kembalikan data contoh'}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
              pendingConfirm === 'clear'
                ? 'bg-destructive text-white border-destructive'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-alt hover:text-text'
            }`}
          >
            {pendingConfirm === 'clear' ? 'Yakin kosongkan semua?' : 'Kosongkan semua'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5 bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <BookOpen size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-text">Data Mata Kuliah</h2>
          </div>
          <p className="text-xs text-text-secondary">
            Tambah, ubah, atau hapus mata kuliah. Menghapus mata kuliah juga melepasnya dari semua mahasiswa.
          </p>
          <form onSubmit={handleMkSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-text-secondary mb-1">Kode</label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="IF301"
                  value={mkKode}
                  onChange={(e) => setMkKode(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono uppercase bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Nama mata kuliah</label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder="Rekayasa Perangkat Lunak"
                  value={mkNama}
                  onChange={(e) => setMkNama(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            {mkError && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle size={14} />
                <span>{mkError}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-md bg-primary text-text-inverse text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {editMkId !== null ? 'Simpan perubahan' : 'Tambah mata kuliah'}
              </button>
              {editMkId !== null && (
                <button
                  type="button"
                  onClick={resetMkForm}
                  className="px-3 py-1.5 rounded-md bg-surface border border-border text-text-secondary text-xs font-medium hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
          <hr className="border-border my-4" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-2 px-2.5">Kode</th>
                  <th className="py-2 px-2.5">Nama</th>
                  <th className="py-2 px-2.5 text-right">Peserta</th>
                  <th className="py-2 px-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-muted">
                      Belum ada mata kuliah.
                    </td>
                  </tr>
                ) : (
                  courses.map((c) => {
                    const enrolled = getEnrolledCount(c.id)
                    const isDeleting = pendingConfirm === `mk:${c.id}`
                    return (
                      <tr key={c.id} className="hover:bg-surface-alt/50 transition-colors">
                        <td className="py-2 px-2.5 font-mono font-medium text-text">{c.kode || c.courseCode}</td>
                        <td className="py-2 px-2.5 text-text-secondary">{c.nama || c.courseName}</td>
                        <td className="py-2 px-2.5 text-right tabular-nums text-text-secondary">{enrolled}</td>
                        <td className="py-2 px-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleEditMk(c)}
                            className="p-1 rounded text-text-secondary hover:text-text hover:bg-surface-alt transition-colors mr-1 cursor-pointer"
                            title="Ubah"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMk(c.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isDeleting
                                ? 'bg-destructive text-white'
                                : 'text-destructive hover:bg-destructive/10'
                            }`}
                          >
                            {isDeleting ? 'Yakin?' : 'Hapus'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="lg:col-span-7 bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Users size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-text">Data Mahasiswa</h2>
          </div>
          <p className="text-xs text-text-secondary">
            Centang mata kuliah yang diambil. Mahasiswa dengan dua mata kuliah atau lebih menciptakan sisi bentrok jadwal.
          </p>
          <form onSubmit={handleMhsSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-text-secondary mb-1">NIM</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="2024011"
                  value={mhsNim}
                  onChange={(e) => setMhsNim(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Nama Mahasiswa</label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder="Nama lengkap"
                  value={mhsNama}
                  onChange={(e) => setMhsNama(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="border border-border rounded-md p-3 bg-surface-alt/30">
              <div className="text-xs font-medium text-text-secondary mb-2">Mata kuliah yang diambil:</div>
              {courses.length === 0 ? (
                <div className="text-xs text-text-muted py-1 italic">
                  Tambahkan data mata kuliah terlebih dahulu di panel sebelah kiri.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {courses.map((c) => {
                    const isChecked = mhsDraftMk.has(c.id) || mhsDraftMk.has(Number(c.id))
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-surface border border-transparent hover:border-border cursor-pointer select-none text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCourseEnrollment(c.id)}
                          className="rounded border-border text-primary focus:ring-ring"
                        />
                        <span className="font-mono font-medium text-text">{c.kode || c.courseCode}</span>
                        <span className="text-text-secondary truncate">{c.nama || c.courseName}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            {mhsError && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle size={14} />
                <span>{mhsError}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-md bg-primary text-text-inverse text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {editMhsId !== null ? 'Simpan perubahan' : 'Tambah mahasiswa'}
              </button>
              {editMhsId !== null && (
                <button
                  type="button"
                  onClick={resetMhsForm}
                  className="px-3 py-1.5 rounded-md bg-surface border border-border text-text-secondary text-xs font-medium hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
          <hr className="border-border my-4" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-2 px-2.5">NIM</th>
                  <th className="py-2 px-2.5">Nama</th>
                  <th className="py-2 px-2.5">Mata Kuliah Diambil</th>
                  <th className="py-2 px-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-muted">
                      Belum ada data mahasiswa.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const studentMkList = (s.mk || []).map((id) => courseById.get(String(id))).filter(Boolean)
                    const isDeleting = pendingConfirm === `mhs:${s.id}`
                    return (
                      <tr key={s.id} className="hover:bg-surface-alt/50 transition-colors">
                        <td className="py-2 px-2.5 font-mono font-medium text-text">{s.nim || s.studentNumber}</td>
                        <td className="py-2 px-2.5 text-text font-medium">{s.nama || s.fullName}</td>
                        <td className="py-2 px-2.5">
                          <div className="flex flex-wrap gap-1">
                            {studentMkList.length === 0 ? (
                              <span className="text-text-muted">-</span>
                            ) : (
                              studentMkList.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-surface-alt border border-border text-text-secondary"
                                  title={c.nama || c.courseName}
                                >
                                  {c.kode || c.courseCode}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleEditMhs(s)}
                            className="p-1 rounded text-text-secondary hover:text-text hover:bg-surface-alt transition-colors mr-1 cursor-pointer"
                            title="Ubah"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMhs(s.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isDeleting
                                ? 'bg-destructive text-white'
                                : 'text-destructive hover:bg-destructive/10'
                            }`}
                          >
                            {isDeleting ? 'Yakin?' : 'Hapus'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
