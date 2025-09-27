"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, RefreshCw, AlertTriangle, CheckCircle, Target, TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react"

interface Insight {
  type: "budget" | "savings" | "investment" | "spending" | "general"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionable: boolean
}

interface InsightsData {
  insights?: Insight[]
  summary?: string
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800 border-red-200"
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low": return "bg-green-100 text-green-800 border-green-200"
    default: return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "budget": return <Target className="h-4 w-4" />
    case "savings": return <PiggyBank className="h-4 w-4" />
    case "investment": return <TrendingUp className="h-4 w-4" />
    case "spending": return <TrendingDown className="h-4 w-4" />
    case "general": return <DollarSign className="h-4 w-4" />
    default: return <Brain className="h-4 w-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "budget": return "text-blue-600"
    case "savings": return "text-green-600"
    case "investment": return "text-purple-600"
    case "spending": return "text-red-600"
    case "general": return "text-gray-600"
    default: return "text-gray-600"
  }
}

export default function AIInsights() {
  const [insights, setInsights] = useState<InsightsData>({ insights: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/insights")
      if (!response.ok) {
        throw new Error("Failed to fetch insights")
      }

      const data = await response.json()
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Analyzing your financial data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Unable to generate insights</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{error}</p>
            <Button onClick={fetchInsights} variant="outline" size="sm" className="mt-3">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {insights.summary && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Financial Summary</h4>
                <p className="text-sm text-blue-700">{insights.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Insights generated based on your recent financial activity
        </p>
        <Button onClick={fetchInsights} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Insights List */}
      {insights.insights && insights.insights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.insights.map((insight, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(insight.type)}
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getTypeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                    {insight.actionable && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <Brain className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 mb-2">No Insights Available</h4>
              <p className="text-sm text-gray-500 mb-4">
                Start adding transactions to receive personalized financial insights
              </p>
              <Button onClick={fetchInsights} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}