"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Currency = 'USD' | 'IDR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
  convertAmount: (amount: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Fixed conversion rate
const USD_TO_IDR_RATE = 16702

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD')

  const convertAmount = (amount: number): number => {
    if (currency === 'IDR') {
      return amount * USD_TO_IDR_RATE
    }
    return amount
  }

  const formatCurrency = (amount: number): string => {
    const convertedAmount = convertAmount(amount)

    if (currency === 'IDR') {
      // Format as IDR with Indonesian locale
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(convertedAmount)
    } else {
      // Format as USD
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(convertedAmount)
    }
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatCurrency,
      convertAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}