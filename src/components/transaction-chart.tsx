"use client";

import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";
import { useCurrency } from "@/lib/currency-context";

export interface TransactionData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  net: {
    label: "Net",
    color: "hsl(var(--chart-3))",
  },
};

interface TransactionChartProps {
  data: TransactionData[];
  className?: string;
}

export function TransactionChart({ data, className }: TransactionChartProps) {
  const { formatCurrency, currency } = useCurrency();

  // Convert data for display
  const convertedData = data.map(item => ({
    ...item,
    income: item.income,
    expenses: item.expenses,
    net: item.net
  }));

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Financial Overview</h3>
            <p className="text-sm text-muted-foreground">Income, Expenses & Net Flow ({currency})</p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={convertedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const convertedValue = currency === 'IDR' ? value * 16702 : value;
                return currency === 'IDR'
                  ? `Rp${(convertedValue / 1000000).toFixed(0)}M`
                  : `$${convertedValue}`;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value: unknown, name: unknown) => {
                  const numericValue = typeof value === 'number' ? value : Number(value);
                  const convertedValue = currency === 'IDR' ? numericValue * 16702 : numericValue;
                  const nameString = typeof name === 'string' ? name : String(name);
                  return [formatCurrency(convertedValue), chartConfig[nameString as keyof typeof chartConfig]?.label || nameString];
                }}
              />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="var(--color-net)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}