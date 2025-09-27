import { createSupabaseServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/user"
import { DashboardClient } from "@/components/dashboard-client"

// Helper function to process transactions for chart display
function processTransactionsForChart(transactions: Array<{
  amount: number
  type: 'income' | 'expense'
  transaction_date: string
}>) {
  const monthlyStats = new Map()

  transactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    if (!monthlyStats.has(monthKey)) {
      monthlyStats.set(monthKey, { income: 0, expenses: 0, net: 0 })
    }

    const amount = Number(transaction.amount)
    if (transaction.type === 'income') {
      monthlyStats.get(monthKey).income += amount
      monthlyStats.get(monthKey).net += amount
    } else {
      monthlyStats.get(monthKey).expenses += amount
      monthlyStats.get(monthKey).net -= amount
    }
  })

  return Array.from(monthlyStats.entries())
    .map(([date, data]) => ({
      date: date,
      income: Math.round(data.income),
      expenses: Math.round(data.expenses),
      net: Math.round(data.net)
    }))
    .slice(-6) // Get last 6 months
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    return <div>Please sign in to view your dashboard.</div>
  }

  const supabase = await createSupabaseServerClient()

  // Get all transactions for the user
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name
      )
    `)
    .order("transaction_date", { ascending: false })
    .limit(50)

  // Get assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .order("last_updated", { ascending: false })

  // Calculate summary data
  const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const netIncome = income - expenses
  const totalAssets = assets?.reduce((sum, a) => sum + Number(a.current_value), 0) || 0

  // Prepare monthly transaction data for chart
  const monthlyData = transactions ? processTransactionsForChart(transactions) : []

  const dashboardData = {
    income,
    expenses,
    netIncome,
    totalAssets,
    monthlyData,
    transactions: transactions || []
  }

  return <DashboardClient data={dashboardData} />
}