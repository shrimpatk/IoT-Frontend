'use client'

import { createContext, useContext, useState } from "react";
import { AuthContextType, LoginInput } from '@/types/auth';
import { gql, useMutation } from '@apollo/client';
import { router } from 'next/client';
import { useRouter } from 'next/navigation';

const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
          access_token
          user {
              displayName 
              email
              id
              username
          }
      }
  }
`

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within auth')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = async (credentials: LoginInput) => {
    try {
      const { data } = await loginMutation({
        variables: {
          loginInput: credentials
        }
      });

      setUser(data.login.user);
      setAccessToken(data.login.access_token);
      localStorage.setItem('access_token', data.login.access_token);
      router.push('/dashboard');
    } catch (e) {
      console.error(e)
    }
  }

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('access_token');
  }

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}