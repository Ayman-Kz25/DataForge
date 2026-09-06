import { useState } from 'react'
import { User, Shield, Key, Bell, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { useAuthStore } from '@/store/authStore'

export default function Settings() {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal profile and security preferences.
        </p>
      </div>

      {saved && (
        <Alert variant="success" onDismiss={() => setSaved(false)}>
          Settings saved successfully.
        </Alert>
      )}

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            <CardTitle>Profile Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user?.email} disabled className="bg-gray-50 dark:bg-gray-800" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-gray-500 font-medium">Account Role:</span>
              <Badge variant={user?.role === 'admin' ? 'primary' : 'default'} className="uppercase">
                {user?.role || 'user'}
              </Badge>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <CardTitle>Security & Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="currentPass">Current Password</Label>
              <Input id="currentPass" type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPass">New Password</Label>
                <Input id="newPass" type="password" placeholder="Minimum 8 characters" />
              </div>
              <div>
                <Label htmlFor="confirmPass">Confirm New Password</Label>
                <Input id="confirmPass" type="password" placeholder="Repeat new password" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
