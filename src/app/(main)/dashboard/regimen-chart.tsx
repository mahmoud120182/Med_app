"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const chartData = [
  { month: "January", adherence: 88 },
  { month: "February", adherence: 92 },
  { month: "March", adherence: 95 },
  { month: "April", adherence: 85 },
  { month: "May", adherence: 88 },
  { month: "June", adherence: 91 },
];

const chartConfig = {
  adherence: {
    label: "Adherence",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function RegimenAdherenceChart() {
    return (
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Regimen Adherence</CardTitle>
            <CardDescription>Monthly adherence rates for active regimens.</CardDescription>
          </CardHeader>
          <CardContent className='flex-grow'>
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false} 
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    indicator="dot"
                    labelClassName="font-semibold" 
                    className="rounded-lg border bg-background p-2 shadow-sm"
                  />} 
                />
                <Bar dataKey="adherence" fill="var(--color-adherence)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
    );
}
