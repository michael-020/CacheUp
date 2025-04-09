import { useNavigate } from "react-router-dom"
import { ArrowLeft, Moon, Sun, LogOut, Trash2 } from "lucide-react"
import { useAuthStore } from "../stores/AuthStore/useAuthStore"
import { useThemeStore } from "@/stores/ThemeStore/useThemeStore"
import { DeleteModal } from "@/components/DeleteModal"
import { useState } from "react"

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false)

  // const [settings, setSettings] = useState({
  //   emailNotifications: true,
  //   messageNotifications: true,
  //   friendRequestNotifications: true,
  //   postNotifications: true,
  //   profileVisibility: "everyone",
  //   messagePermission: "everyone", 
  //   showOnlineStatus: true,
  //   showReadReceipts: true,
  //   showLastSeen: true,
  // })

  const handleToggleTheme = () => {
    toggleTheme()
    const isDarkNow = !isDark
    if (isDarkNow) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // const handleSettingChange = (setting: string, value: any) => {
  //   setSettings((prev) => ({
  //     ...prev,
  //     [setting]: value,
  //   }))

  //   toast.success(`${setting} setting updated!`)
  // }

  const handleChangePassword = () => {
    navigate("/change-password")
  }

  const handleDeleteAccount = () => {
    setIsModalOpen(!isModalOpen)
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-100 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Settings</h1>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Account Settings */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Account Settings</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Edit Profile</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile information</p>
                </div>
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Edit
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Change Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your password securely</p>
                </div>
                <button 
                  onClick={handleChangePassword} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Change
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                </div>
                <button onClick={handleToggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-neutral-700">
                  {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          {/* <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Notification Settings</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Email Notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange("emailNotifications", !settings.emailNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Message Notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.messageNotifications}
                    onChange={() => handleSettingChange("messageNotifications", !settings.messageNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Friend Request Notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.friendRequestNotifications}
                    onChange={() =>
                      handleSettingChange("friendRequestNotifications", !settings.friendRequestNotifications)
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Post Notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.postNotifications}
                    onChange={() => handleSettingChange("postNotifications", !settings.postNotifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div> */}

          {/* Privacy Settings */}
          {/* <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Privacy Settings</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Profile Visibility</p>
                </div>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white"
                  value={settings.profileVisibility}
                  onChange={(e) => handleSettingChange("profileVisibility", e.target.value)}
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends Only</option>
                  <option value="none">Private</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Who can message you</p>
                </div>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white"
                  value={settings.messagePermission}
                  onChange={(e) => handleSettingChange("messagePermission", e.target.value)}
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends Only</option>
                  <option value="none">No one</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Show Online Status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.showOnlineStatus}
                    onChange={() => handleSettingChange("showOnlineStatus", !settings.showOnlineStatus)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Show Read Receipts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.showReadReceipts}
                    onChange={() => handleSettingChange("showReadReceipts", !settings.showReadReceipts)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <p className="text-gray-800 dark:text-white">Show Last Seen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.showLastSeen}
                    onChange={() => handleSettingChange("showLastSeen", !settings.showLastSeen)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div> */}

          {/* Security Settings */}
          {/* <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Security Settings</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                  Setup
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Active Sessions</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your active login sessions</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                  View
                </button>
              </div>
            </div>
          </div> */}

          {/* Account Actions */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Account Actions</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Logout</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    navigate("/signin")
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
                >
                  Logout
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">Delete Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Campus Connect &copy; {new Date().getFullYear()}</p>
          <DeleteModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} deleteHandler={handleDeleteAccount} content="Delete Account?" />
          {/* <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-blue-500 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-500 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-500 transition">
              Help Center
            </a>
          </div> */}
        </div>
      </div>
    </div>
  )
}