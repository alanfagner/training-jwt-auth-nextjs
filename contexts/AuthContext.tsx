import { createContext, ReactNode, useEffect, useState } from "react"
import { api } from "../services/apiClient"
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

type User = {
  email: string
  permissions: string[]
  roles: string[]
}

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>
  signOut(): void;
  user: User
  isAuthenticated: boolean
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut(ctx = undefined) {
  destroyCookie(ctx, 'nextauth.token')
  destroyCookie(ctx, 'nextauth.refreshToken')

  authChannel.postMessage('signOut')

  if (process.browser) {
    Router.push('/')
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user


  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (msg) => {
      switch (msg.data) {
        case 'signOut':
          signOut()
          break;
      }
    }
  }, [])

  useEffect(() => {

    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get('/me').then(response => {
        const { permissions, roles, email } = response.data

        setUser({ email, permissions, roles })
      }).catch((error => {
        signOut()
      }))
    }

  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    const { data } = await api.post('/sessions', { email, password })

    const { permissions, roles, token, refreshToken } = data

    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    setUser({
      email,
      permissions,
      roles
    })

    api.defaults.headers['Authorization'] = `Bearer ${token}`

    Router.push('/dashboard')

  }

  return <AuthContext.Provider value={{ signOut, isAuthenticated, signIn, user }}>{children}</AuthContext.Provider>
}