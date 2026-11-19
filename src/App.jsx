import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import DataPage from '@/pages/DataPage'
import SlotsPage from '@/pages/SlotsPage'
import SchedulePage from '@/pages/SchedulePage'
import GraphPage from '@/pages/GraphPage'
import NotFoundPage from '@/pages/NotFoundPage'
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/data" replace />} />
        <Route path="data" element={<DataPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="graph" element={<GraphPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
