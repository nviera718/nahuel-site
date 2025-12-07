import { useAuth0 } from '@auth0/auth0-react'

export const UserProfile = ({ className = '' }) => {
  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div className={`text-gray-400 ${className}`}>Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name}
          className="w-10 h-10 rounded-full border-2 border-blue-500"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-200">{user.name}</span>
        <span className="text-xs text-gray-400">{user.email}</span>
      </div>
    </div>
  )
}
