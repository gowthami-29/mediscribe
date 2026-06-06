import { useEffect, useState } from 'react'
import { adminApi } from '@/api/admin'

export default function OrganizationSettings() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const [changingPassword, setChangingPassword] =
  useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data =
        await adminApi.getOrganizationSettings()

      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || ''
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)

      await adminApi.updateOrganizationSettings(
        form
      )

      alert('Settings updated successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }
  const changePassword = async () => {
  if (
    passwordForm.new_password !==
    passwordForm.confirm_password
  ) {
    alert("Passwords do not match")
    return
  }

  try {
    setChangingPassword(true)

    await adminApi.changeOrganizationPassword(
      passwordForm.current_password,
      passwordForm.new_password
    )

    alert("Password changed successfully")

    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
  } catch (err) {
    console.error(err)
    alert("Failed to change password")
  } finally {
    setChangingPassword(false)
  }
}

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Organization Settings
      </h1>

      <div className="bg-white rounded-lg shadow border p-6 max-w-2xl">

        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Organization Name
          </label>

          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
            className="w-full border rounded p-3"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Organization Email
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            className="w-full border rounded p-3"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Phone Number
          </label>

          <input
            type="text"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value
              })
            }
            className="w-full border rounded p-3"
          />
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          {saving
            ? 'Saving...'
            : 'Save Changes'}
        </button>

      </div>
      <hr className="my-8" />

<h2 className="text-xl font-semibold mb-4">
  Change Password
</h2>

<div className="mb-4">
  <label className="block mb-2 font-medium">
    Current Password
  </label>

  <input
    type="password"
    value={passwordForm.current_password}
    onChange={(e) =>
      setPasswordForm({
        ...passwordForm,
        current_password: e.target.value
      })
    }
    className="w-full border rounded p-3"
  />
</div>

<div className="mb-4">
  <label className="block mb-2 font-medium">
    New Password
  </label>

  <input
    type="password"
    value={passwordForm.new_password}
    onChange={(e) =>
      setPasswordForm({
        ...passwordForm,
        new_password: e.target.value
      })
    }
    className="w-full border rounded p-3"
  />
</div>

<div className="mb-6">
  <label className="block mb-2 font-medium">
    Confirm New Password
  </label>

  <input
    type="password"
    value={passwordForm.confirm_password}
    onChange={(e) =>
      setPasswordForm({
        ...passwordForm,
        confirm_password: e.target.value
      })
    }
    className="w-full border rounded p-3"
  />
</div>

<button
  onClick={changePassword}
  disabled={changingPassword}
  className="bg-green-600 text-white px-6 py-3 rounded"
>
  {changingPassword
    ? "Updating..."
    : "Change Password"}
</button>
    </div>
  )
}