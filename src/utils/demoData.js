export const demoCourses = [
  { id: 1, kode: 'IF101', nama: 'Algoritma dan Pemrograman', courseCode: 'IF101', courseName: 'Algoritma dan Pemrograman' },
  { id: 2, kode: 'IF102', nama: 'Struktur Data', courseCode: 'IF102', courseName: 'Struktur Data' },
  { id: 3, kode: 'IF201', nama: 'Basis Data', courseCode: 'IF201', courseName: 'Basis Data' },
  { id: 4, kode: 'IF202', nama: 'Jaringan Komputer', courseCode: 'IF202', courseName: 'Jaringan Komputer' },
  { id: 5, kode: 'IF203', nama: 'Sistem Operasi', courseCode: 'IF203', courseName: 'Sistem Operasi' },
  { id: 6, kode: 'MA101', nama: 'Kalkulus', courseCode: 'MA101', courseName: 'Kalkulus' },
  { id: 7, kode: 'MA102', nama: 'Matematika Diskrit', courseCode: 'MA102', courseName: 'Matematika Diskrit' },
  { id: 8, kode: 'EN101', nama: 'Bahasa Inggris', courseCode: 'EN101', courseName: 'Bahasa Inggris' },
]
export const demoStudents = [
  { id: 1, nim: '2024001', nama: 'Andi Pratama', studentNumber: '2024001', fullName: 'Andi Pratama', mk: [1, 6, 8] },
  { id: 2, nim: '2024002', nama: 'Budi Santoso', studentNumber: '2024002', fullName: 'Budi Santoso', mk: [1, 2, 7] },
  { id: 3, nim: '2024003', nama: 'Citra Lestari', studentNumber: '2024003', fullName: 'Citra Lestari', mk: [2, 3, 7] },
  { id: 4, nim: '2024004', nama: 'Dewi Anggraini', studentNumber: '2024004', fullName: 'Dewi Anggraini', mk: [3, 4, 5] },
  { id: 5, nim: '2024005', nama: 'Eko Wijaya', studentNumber: '2024005', fullName: 'Eko Wijaya', mk: [4, 5, 6] },
  { id: 6, nim: '2024006', nama: 'Fitri Handayani', studentNumber: '2024006', fullName: 'Fitri Handayani', mk: [6, 7, 8] },
  { id: 7, nim: '2024007', nama: 'Gilang Ramadhan', studentNumber: '2024007', fullName: 'Gilang Ramadhan', mk: [1, 3, 8] },
  { id: 8, nim: '2024008', nama: 'Hana Putri', studentNumber: '2024008', fullName: 'Hana Putri', mk: [5, 7, 8] },
]
export const defaultSlots = [
  { id: 1, slotNumber: 1, day: 'Senin', startTime: '08:00', endTime: '10:00', label: 'Senin, 08:00 - 10:00' },
  { id: 2, slotNumber: 2, day: 'Senin', startTime: '10:30', endTime: '12:30', label: 'Senin, 10:30 - 12:30' },
  { id: 3, slotNumber: 3, day: 'Selasa', startTime: '08:00', endTime: '10:00', label: 'Selasa, 08:00 - 10:00' },
  { id: 4, slotNumber: 4, day: 'Selasa', startTime: '10:30', endTime: '12:30', label: 'Selasa, 10:30 - 12:30' },
  { id: 5, slotNumber: 5, day: 'Rabu', startTime: '08:00', endTime: '10:00', label: 'Rabu, 08:00 - 10:00' },
  { id: 6, slotNumber: 6, day: 'Rabu', startTime: '10:30', endTime: '12:30', label: 'Rabu, 10:30 - 12:30' },
  { id: 7, slotNumber: 7, day: 'Kamis', startTime: '08:00', endTime: '10:00', label: 'Kamis, 08:00 - 10:00' },
  { id: 8, slotNumber: 8, day: 'Kamis', startTime: '10:30', endTime: '12:30', label: 'Kamis, 10:30 - 12:30' },
  { id: 9, slotNumber: 9, day: 'Jumat', startTime: '08:00', endTime: '10:00', label: 'Jumat, 08:00 - 10:00' },
  { id: 10, slotNumber: 10, day: 'Jumat', startTime: '10:30', endTime: '12:30', label: 'Jumat, 10:30 - 12:30' },
]
export const SLOT_PALETTE = [
  { bg: '#2563EB', text: '#FFFFFF', name: 'Blue' },
  { bg: '#D97706', text: '#FFFFFF', name: 'Amber' },
  { bg: '#16A34A', text: '#FFFFFF', name: 'Green' },
  { bg: '#9333EA', text: '#FFFFFF', name: 'Purple' },
  { bg: '#DC2626', text: '#FFFFFF', name: 'Red' },
  { bg: '#0D9488', text: '#FFFFFF', name: 'Teal' },
  { bg: '#EA580C', text: '#FFFFFF', name: 'Orange' },
  { bg: '#4F46E5', text: '#FFFFFF', name: 'Indigo' },
  { bg: '#0284C7', text: '#FFFFFF', name: 'Sky' },
  { bg: '#475569', text: '#FFFFFF', name: 'Slate' },
]
export function getSlotColor(slotNumber) {
  const num = Number(slotNumber) || 1
  return SLOT_PALETTE[(num - 1) % SLOT_PALETTE.length]
}
export function getEnrollmentsFromStudents(students = []) {
  const enrollments = []
  for (const s of students) {
    if (Array.isArray(s.mk)) {
      for (const courseId of s.mk) {
        enrollments.push({
          id: `${s.id}-${courseId}`,
          studentId: String(s.id),
          courseId: String(courseId),
        })
      }
    }
  }
  return enrollments
}
export const demoData = {
  students: demoStudents,
  courses: demoCourses,
  enrollments: getEnrollmentsFromStudents(demoStudents),
  periods: [],
  slots: defaultSlots,
}
