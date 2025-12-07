import { useAuth0 } from '@auth0/auth0-react'

export const LoginButton = ({ className = '' }) => {
  const { loginWithRedirect } = useAuth0()

  return (
    <button
      onClick={() => loginWithRedirect()}
      className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 ${className}`}
    >
      Log In
    </button>
  )
}
