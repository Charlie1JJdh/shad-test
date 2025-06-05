"use client"

import React, { createContext, useContext, useState } from 'react'

interface RFQDialogContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const RFQDialogContext = createContext<RFQDialogContextType | undefined>(undefined)

export function RFQDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <RFQDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </RFQDialogContext.Provider>
  )
}

export function useRFQDialog() {
  const context = useContext(RFQDialogContext)
  if (context === undefined) {
    throw new Error('useRFQDialog must be used within a RFQDialogProvider')
  }
  return context
} 