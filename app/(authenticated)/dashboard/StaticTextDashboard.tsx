import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StaticTextDashboard({ title, value, time }: { title: string; value: string; time: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs mt-2">{time}</div>
      </CardContent>
    </Card>
  )
}