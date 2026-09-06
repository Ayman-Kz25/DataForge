import { useEffect, useState } from 'react'
import {
  Shield,
  Users,
  Database,
  AlertTriangle,
  UserCheck,
  UserX,
  RefreshCw,
  Search
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { LoadingScreen } from '@/components/ui/spinner'
import { adminService } from '@/services/api'
import { formatDate, formatNumber } from '@/utils/formatters'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingUserId, setTogglingUserId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [statsRes, usersRes, alertsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getAlerts(),
      ])

      setStats(statsRes.data.data)
      setUsers(usersRes.data.data || [])
      setAlerts(alertsRes.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin telemetry.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setTogglingUserId(userId)
      await adminService.updateUserStatus(userId, !currentStatus)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.')
    } finally {
      setTogglingUserId(null)
    }
  }

  if (isLoading) return <LoadingScreen message="Loading admin telemetry..." />

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Phase 12</Badge>
            <span className="text-xs text-gray-500 font-mono">Role: Administrator</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Administration & Telemetry
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Global system statistics, suspicious datasets monitoring, and user governance.
          </p>
        </div>

        <Button variant="secondary" onClick={loadAdminData} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(stats.totalUsers)}
                </p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(stats.activeUsers)}
                </p>
                <p className="text-xs text-gray-500">Active Accounts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(stats.totalDatasets)}
                </p>
                <p className="text-xs text-gray-500">Datasets Processed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(stats.suspiciousDatasets)}
                </p>
                <p className="text-xs text-gray-500">Suspicious Alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspicious Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-900/40">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Suspicious Datasets Flagged ({alerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {alerts.map((alert) => (
                <div key={alert._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{alert.originalName}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded by {alert.userId?.name || 'Unknown'} ({alert.userId?.email || 'N/A'}) • {formatDate(alert.createdAt)}
                    </p>
                  </div>
                  <Badge variant="danger">Low Quality / Extreme Anomalies</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Governance Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Registered Users ({users.length})</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'admin' ? 'primary' : 'default'} className="uppercase">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant={u.isActive ? 'secondary' : 'primary'}
                      disabled={togglingUserId === u._id}
                      onClick={() => handleToggleStatus(u._id, u.isActive)}
                      className="text-xs h-8"
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
