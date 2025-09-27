"use client"

import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/currency-context"
import { DollarSign, Coins } from "lucide-react"

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('USD')}
        className="flex items-center space-x-1 h-8 px-3"
      >
        <DollarSign className="w-3 h-3" />
        <span className="text-sm font-medium">USD</span>
      </Button>
      <Button
        variant={currency === 'IDR' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('IDR')}
        className="flex items-center space-x-1 h-8 px-3"
      >
        <Coins className="w-3 h-3" />
        <span className="text-sm font-medium">IDR</span>
      </Button>
    </div>
  )
}