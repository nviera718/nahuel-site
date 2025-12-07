import { useAuth0 } from '@auth0/auth0-react'

export const LogoutButton = ({ className = '' }) => {
  const { logout } = useAuth0()

  return (
    <button
      onClick={() =>
        logout({
          logoutParams: {
            returnTo: window.location.origin + '/content-farm',
          },
        })
      }
      className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 ${className}`}
    >
      Log Out
    </button>
  )
}
