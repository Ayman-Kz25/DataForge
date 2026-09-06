import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import MyDatasets from '@/pages/MyDatasets'
import UploadDataset from '@/pages/UploadDataset'
import DatasetDetail from '@/pages/DatasetDetail'
import DataProfile from '@/pages/DataProfile'
import ValidationResults from '@/pages/ValidationResults'
import AnomalyDetection from '@/pages/AnomalyDetection'
import Cleaning from '@/pages/Cleaning'
import Comparison from '@/pages/Comparison'
import Analytics from '@/pages/Analytics'
import AIInsights from '@/pages/AIInsights'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UserManagement from '@/pages/admin/UserManagement'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/datasets" element={<MyDatasets />} />
          <Route path="/datasets/upload" element={<UploadDataset />} />
          <Route path="/datasets/:id" element={<DatasetDetail />} />
          <Route path="/datasets/:id/profile" element={<DataProfile />} />
          <Route path="/datasets/:id/validation" element={<ValidationResults />} />
          <Route path="/datasets/:id/anomalies" element={<AnomalyDetection />} />
          <Route path="/datasets/:id/cleaning" element={<Cleaning />} />
          <Route path="/datasets/:id/comparison" element={<Comparison />} />
          <Route path="/datasets/:id/analytics" element={<Analytics />} />
          <Route path="/datasets/:id/insights" element={<AIInsights />} />
          <Route path="/datasets/:id/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
