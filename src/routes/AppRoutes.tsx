import { Routes, Route, Navigate } from 'react-router-dom'
import { MainScreen } from '../pages/MainScreen'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}