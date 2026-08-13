"use client";

import type * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { BarChart3 } from "lucide-react";
import type { AdminStats } from "@/lib/admin/stats";

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function ChartCard({
  title,
  description,
  isEmpty,
  children,
}: {
  title: string;
  description?: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-card-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4">
        {isEmpty ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3 aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No data yet</EmptyTitle>
              <EmptyDescription>Check back once activity comes in.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function MessagesPerWeekChart({ data }: { data: AdminStats["charts"]["messagesPerWeek"] }) {
  const isEmpty = data.every((d) => d.count === 0);
  const config: ChartConfig = { count: { label: "Messages", color: "var(--chart-1)" } };

  return (
    <ChartCard title="Contact messages" description="Last 12 weeks" isEmpty={isEmpty}>
      <ChartContainer config={config} className="aspect-auto h-52 w-full">
        <AreaChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            }
          />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="count"
            type="monotone"
            fill="var(--chart-1)"
            fillOpacity={0.2}
            stroke="var(--chart-1)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function SkillsByCategoryChart({ data }: { data: AdminStats["charts"]["skillsByCategory"] }) {
  const isEmpty = data.length === 0;
  const config: ChartConfig = { count: { label: "Skills", color: "var(--chart-1)" } };

  return (
    <ChartCard title="Skills by category" isEmpty={isEmpty}>
      <ChartContainer config={config} className="aspect-auto h-52 w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="category"
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function PlaygroundActivityChart({
  data,
}: {
  data: AdminStats["charts"]["playgroundActivityDaily"];
}) {
  const isEmpty = data.every((d) => d.count === 0);
  const config: ChartConfig = { count: { label: "Messages", color: "var(--chart-2)" } };

  return (
    <ChartCard title="Playground activity" description="Last 30 days" isEmpty={isEmpty}>
      <ChartContainer config={config} className="aspect-auto h-52 w-full">
        <LineChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={6}
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            }
          />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="count"
            type="monotone"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

export function ProjectsByCategoryChart({
  data,
}: {
  data: AdminStats["charts"]["projectsByCategory"];
}) {
  const isEmpty = data.length === 0;
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.category, { label: d.category, color: CATEGORY_COLORS[i % 5] }])
  );

  return (
    <ChartCard title="Projects by category" isEmpty={isEmpty}>
      <ChartContainer config={config} className="aspect-auto h-52 w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie data={data} dataKey="count" nameKey="category" innerRadius={48} outerRadius={72} strokeWidth={2}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[index % 5]} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="category" />} />
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
}
