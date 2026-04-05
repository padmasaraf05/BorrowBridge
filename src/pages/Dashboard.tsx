import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Inbox, Package, Star } from "lucide-react";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const notificationEmoji: Record<string, string> = {
  request_received: "📥",
  request_accepted: "✅",
  request_declined: "❌",
  request_cancelled: "🚫",
  message_received: "💬",
  review_received: "⭐",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingRequests: 0,
    completedTransactions: 0,
    rating: 0,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [listingsRes, incomingRes, outgoingRes, notifRes] =
          await Promise.all([
            api.get("/listings/my-listings"),
            api.get("/requests/incoming"),
            api.get("/requests/outgoing"),
            api.get("/notifications"),
          ]);

        const myListings = listingsRes.data.listings;
        const incoming = incomingRes.data.requests;
        const outgoing = outgoingRes.data.requests;
        const allNotifications = notifRes.data.notifications;

        // Calculate stats
        const activeListings = myListings.filter(
          (l: any) => l.isAvailable
        ).length;
        const pendingRequests = incoming.filter(
          (r: any) => r.status === "pending"
        ).length;
        const completedTransactions = [
          ...incoming,
          ...outgoing,
        ].filter((r: any) => r.status === "completed").length;

        setStats({
          activeListings,
          pendingRequests,
          completedTransactions,
          rating: user?.rating || 0,
        });

        // Recent notifications as activity feed
        setNotifications(allNotifications.slice(0, 5));

        // Upcoming bookings — accepted requests
        const upcomingBookings = incoming
          .filter((r: any) => r.status === "accepted")
          .slice(0, 2);
        setBookings(upcomingBookings);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const statCards = [
    { icon: Tag, label: "Active Listings", value: stats.activeListings },
    { icon: Inbox, label: "Pending Requests", value: stats.pendingRequests },
    { icon: Package, label: "Completed Transactions", value: stats.completedTransactions },
    { icon: Star, label: "Your Rating", value: stats.rating || "N/A" },
  ];

  const quickActions = [
    { label: "+ Add New Listing", to: "/add-listing" },
    { label: "Browse Items", to: "/browse" },
    { label: "View Requests", to: "/requests" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-primary/10 px-6 py-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          {getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's what's happening with your listings today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <s.icon className="h-7 w-7 text-primary" />
              <span className="text-3xl font-bold text-primary">
                {loading ? "..." : s.value}
              </span>
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
              <Button
                variant={a.label.startsWith("+") ? "default" : "secondary"}
                size="sm"
              >
                {a.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity from real notifications */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              Recent Activity
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((n: any) => (
                  <li key={n._id} className="flex items-start gap-3 text-sm">
                    <span className="text-lg leading-none">
                      {notificationEmoji[n.type] || "🔔"}
                    </span>
                    <div className="flex-1">
                      <p className={n.isRead ? "text-muted-foreground" : "font-medium"}>
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              Upcoming Bookings
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming bookings.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b: any) => (
                  <div
                    key={b._id}
                    className="rounded-lg border p-4 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {b.listing?.title || "Item"}
                      </span>
                      <Badge>Confirmed</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Borrower: {b.requester?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(b.fromDate)} – {formatDate(b.toDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;