import { useState } from 'react'
import useStore from '@/store/useStore'
import { defaultSlots, getSlotColor } from '@/utils/demoData'
import { Clock, Plus, Trash2, Edit2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react'
const PRESET_SESSIONS = [
  { name: 'Sesi 1 (Pagi)', start: '08:00', end: '10:00' },
  { name: 'Sesi 2 (Siang)', start: '10:30', end: '12:30' },
  { name: 'Sesi 3 (Siang 2)', start: '13:30', end: '15:30' },
  { name: 'Sesi 4 (Sore)', start: '16:00', end: '18:00' },
]
export default function SlotsPage() {
  const { slots, setSlots } = useStore()
  const [day, setDay] = useState('Senin')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const normalizeTime = (str) => {
    if (!str) return ''
    let cleaned = str.trim().replace('.', ':')
    const parts = cleaned.split(':')
    if (parts.length === 2) {
      const h = parts[0].padStart(2, '0')
      const m = parts[1].padEnd(2, '0').slice(0, 2)
      return `${h}:${m}`
    }
    return cleaned
  }
  const resetForm = () => {
    setEditId(null)
    setDay('Senin')
    setStartTime('08:00')
    setEndTime('10:00')
    setError('')
  }
  const applyPreset = (preset) => {
    setStartTime(preset.start)
    setEndTime(preset.end)
    setError('')
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    const normStart = normalizeTime(startTime)
    const normEnd = normalizeTime(endTime)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!normStart || !normEnd) {
      setError('Jam mulai dan jam selesai wajib diisi (format JJ:MM, contoh: 08:00).')
      return
    }
    if (!timeRegex.test(normStart) || !timeRegex.test(normEnd)) {
      setError('Format jam tidak valid. Gunakan format JJ:MM seperti 08:00 atau 10:30.')
      return
    }
    if (normStart >= normEnd) {
      setError('Jam mulai harus lebih awal dari jam selesai.')
      return
    }
    const label = `${day}, ${normStart} - ${normEnd}`
    if (editId !== null) {
      const updated = slots.map((s) =>
        s.id === editId
          ? {
              ...s,
              day,
              startTime: normStart,
              endTime: normEnd,
              label,
            }
          : s,
      )
      setSlots(updated)
    } else {
      const nextId = slots.length > 0 ? Math.max(...slots.map((s) => Number(s.id) || 0)) + 1 : 1
      const nextSlotNumber = slots.length + 1
      const newSlot = {
        id: nextId,
        slotNumber: nextSlotNumber,
        day,
        startTime: normStart,
        endTime: normEnd,
        label,
      }
      setSlots([...slots, newSlot])
    }
    resetForm()
  }
  const handleEdit = (slot) => {
    setEditId(slot.id)
    setDay(slot.day || 'Senin')
    setStartTime(slot.startTime ? normalizeTime(slot.startTime) : '08:00')
    setEndTime(slot.endTime ? normalizeTime(slot.endTime) : '10:00')
    setError('')
  }
  const handleDelete = (id) => {
    if (pendingConfirm !== `del:${id}`) {
      setPendingConfirm(`del:${id}`)
      return
    }
    setPendingConfirm(null)
    const updated = slots
      .filter((s) => s.id !== id)
      .map((s, index) => ({
        ...s,
        slotNumber: index + 1,
      }))
    setSlots(updated)
    if (editId === id) resetForm()
  }
  const handleResetSlots = () => {
    if (pendingConfirm !== 'reset-slots') {
      setPendingConfirm('reset-slots')
      return
    }
    setPendingConfirm(null)
    setSlots(defaultSlots)
    resetForm()
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Manajemen Slot Waktu Ujian</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Setiap nomor slot merepresentasikan satu warna hasil pewarnaan graf Welsh-Powell.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetSlots}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
            pendingConfirm === 'reset-slots'
              ? 'bg-destructive text-white border-destructive'
              : 'bg-surface text-text-secondary border-border hover:bg-surface-alt hover:text-text'
          }`}
        >
          {pendingConfirm === 'reset-slots' ? 'Yakin reset ke default?' : 'Reset ke Slot Default'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5 bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Clock size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-text">
              {editId !== null ? 'Ubah Slot Waktu' : 'Tambah Slot Baru'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Hari Ujian</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Jam Mulai <span className="text-text-muted font-normal">(JJ:MM)</span>
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="08:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Jam Selesai <span className="text-text-muted font-normal">(JJ:MM)</span>
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="10:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-mono bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="pt-1">
              <div className="text-[11px] font-medium text-text-muted mb-1.5 flex items-center gap-1">
                <Sparkles size={12} />
                <span>Pilih cepat sesi jam:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_SESSIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2 py-1 text-[11px] rounded bg-surface-alt/70 hover:bg-surface-alt border border-border text-text text-left transition-colors cursor-pointer truncate"
                  >
                    <strong>{preset.start}-{preset.end}</strong> <span className="text-text-muted text-[10px]">({preset.name.split(' ')[1]})</span>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-md bg-primary text-text-inverse text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {editId !== null ? 'Simpan Perubahan' : 'Tambah Slot'}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-md bg-surface border border-border text-text-secondary text-xs font-medium hover:bg-surface-alt transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="lg:col-span-7 bg-surface border border-border rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-base font-semibold text-text">Daftar Slot Sesi Tersedia</h2>
            <span className="text-xs font-mono text-text-muted">Total: {slots.length} Slot</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Slot / Warna</th>
                  <th className="py-2.5 px-3">Hari</th>
                  <th className="py-2.5 px-3">Jam Ujian</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-muted">
                      Belum ada slot waktu. Tambahkan atau klik "Reset ke Slot Default".
                    </td>
                  </tr>
                ) : (
                  slots.map((s, index) => {
                    const slotNum = Number(s.slotNumber) || index + 1
                    const col = getSlotColor(slotNum)
                    const isDeleting = pendingConfirm === `del:${s.id}`
                    const timeRange =
                      s.startTime && s.endTime
                        ? `${s.startTime} - ${s.endTime}`
                        : s.label
                        ? s.label.split(',')[1] || s.label
                        : '08:00 - 10:00'
                    return (
                      <tr key={s.id} className="hover:bg-surface-alt/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="inline-flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: col.bg }}
                            />
                            <span className="font-semibold text-text font-mono">
                              Slot {slotNum}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-text">{s.day || 'Senin'}</td>
                        <td className="py-2.5 px-3 text-text-secondary font-mono">
                          {timeRange}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleEdit(s)}
                            className="p-1 rounded text-text-secondary hover:text-text hover:bg-surface-alt transition-colors mr-1 cursor-pointer"
                            title="Ubah"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
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
