'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
} | null

type AuthResponse = {
  data?: any
  error: any
}

type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<AuthResponse>
  signup: (email: string, password: string, name: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Check if email is not confirmed
        if (error.message === 'Email not confirmed') {
          return { 
            data: null,
            error: { 
              message: 'Please check your email to confirm your account before logging in.' 
            } 
          }
        }
        throw error;
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Login failed:', error)
      return { 
        data: null,
        error: { 
          message: error.message || 'Invalid login credentials' 
        } 
      }
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error;
      
      // If email confirmation is required, show a message
      if (data.user?.identities?.length === 0) {
        return { 
          data: null,
          error: { 
            message: 'This email is already registered. Please log in or use a different email.' 
          } 
        };
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Signup failed:', error)
      return { 
        data: null,
        error: { 
          message: error.message || 'Failed to create account. Please try again.' 
        } 
      }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
