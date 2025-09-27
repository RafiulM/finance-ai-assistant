import { createSupabaseServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeDollarSign, TrendingUp, TrendingDown, Calendar, Brain } from "lucide-react"
import AIInsights from "@/components/ai-insights"

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

  // Data preparation for potential future use

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
        <p className="text-muted-foreground">Track your income, expenses, and assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${income.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${expenses.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            {netIncome >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalAssets.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Financial Insights
          </CardTitle>
          <CardDescription>
            Personalized suggestions and analysis based on your financial patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIInsights />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Your latest income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description || 'Transaction'}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.categories?.name} • {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No transactions yet. Start by logging your first transaction!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}