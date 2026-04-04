import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Inbox, Package, Star, Plus, Search, Eye, ArrowRight } from "lucide-react";

const stats = [
  { icon: Tag, label: "Active Listings", value: 4 },
  { icon: Inbox, label: "Pending Requests", value: 2 },
  { icon: Package, label: "Completed Transactions", value: 9 },
  { icon: Star, label: "Your Rating", value: 4.7 },
];

const quickActions = [
  { label: "+ Add New Listing", to: "/add-listing" },
  { label: "Browse Items", to: "/browse" },
  { label: "View Requests", to: "/browse" },
];

const activities = [
  { emoji: "📥", text: "Priya Mehta requested your Physics textbook", time: "2h ago" },
  { emoji: "✅", text: "You accepted Rahul's request", time: "Yesterday" },
  { emoji: "⭐", text: "You received a 5-star review", time: "2 days ago" },
  { emoji: "📤", text: "You sent a request for Calculator", time: "3 days ago" },
  { emoji: "🚀", text: "You published: Lab Coat (L size)", time: "5 days ago" },
];

const bookings = [
  {
    item: "Engineering Maths Vol. 2",
    borrower: "Priya Mehta",
    dates: "Apr 1 – Apr 10, 2025",
    status: "Confirmed",
  },
  {
    item: "Scientific Calculator",
    borrower: "Rahul Verma",
    dates: "Apr 5 – Apr 8, 2025",
    status: "Pending",
  },
];

const Dashboard = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    {/* Welcome Banner */}
    <div className="rounded-xl bg-primary/10 px-6 py-6">
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Good morning, Arjun 👋</h1>
      <p className="mt-1 text-muted-foreground">Here's what's happening with your listings today.</p>
    </div>

    {/* Stats */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <s.icon className="h-7 w-7 text-primary" />
            <span className="text-3xl font-bold text-primary">{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Quick Actions */}
    <div>
      <h2 className="font-heading text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        {quickActions.map((a) => (
          <Link key={a.label} to={a.to}>
            <Button variant={a.label.startsWith("+") ? "default" : "secondary"} size="sm">
              {a.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            {activities.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-lg leading-none">{a.emoji}</span>
                <div className="flex-1">
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Upcoming Bookings</h2>
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{b.item}</span>
                  <Badge variant={b.status === "Confirmed" ? "default" : "secondary"}>
                    {b.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Borrower: {b.borrower}</p>
                <p className="text-sm text-muted-foreground">{b.dates}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Dashboard;
