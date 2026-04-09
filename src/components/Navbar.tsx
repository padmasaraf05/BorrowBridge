import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu, X, Bell, LayoutDashboard, User,
  List, Star, HelpCircle, LogOut, CheckCheck,
  MessageSquare, Package, Tag,
} from "lucide-react";
import BorrowBridgeLogo from "@/components/BorrowBridgeLogo";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";

// Notification type → icon + color mapping
const notifConfig: Record<string, { icon: any; color: string }> = {
  request_received:  { icon: Package,        color: "text-blue-500" },
  request_accepted:  { icon: CheckCheck,      color: "text-green-500" },
  request_declined:  { icon: X,              color: "text-red-500" },
  request_cancelled: { icon: X,              color: "text-gray-500" },
  message_received:  { icon: MessageSquare,  color: "text-primary" },
  review_received:   { icon: Star,           color: "text-yellow-500" },
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications.slice(0, 8));
      const unread = res.data.notifications.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  };

useEffect(() => {
  if (!isLoggedIn) return;

  // ✅ Delay 1s after login before first fetch
  // Prevents race with Dashboard API calls
  const initialTimer = setTimeout(() => {
    fetchNotifications();
  }, 1000);

  const interval = setInterval(fetchNotifications, 30000);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
  };
}, [isLoggedIn]);

  // Mark all as read when opening dropdown
  const handleNotifOpen = async (isOpen: boolean) => {
    setNotifOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      try {
        await api.put("/notifications/read-all");
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      } catch {
        // silently fail
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BorrowBridgeLogo size={36} showText={true} className="flex-row gap-2" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/browse"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </Link>
          {isLoggedIn && (
            <Link to="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
              {/* ── Notification Bell Dropdown ── */}
              <DropdownMenu onOpenChange={handleNotifOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="relative rounded-full p-1 hover:bg-muted transition-colors focus:outline-none">
                    <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-heading text-sm font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {notifications.filter((n) => !n.isRead).length === 0
                          ? "All caught up ✓"
                          : `${notifications.filter((n) => !n.isRead).length} unread`}
                      </span>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 stroke-1 mb-2" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif: any) => {
                        const config = notifConfig[notif.type] || {
                          icon: Bell,
                          color: "text-primary",
                        };
                        const IconComponent = config.icon;
                        return (
                          <div
                            key={notif._id}
                            className={`flex items-start gap-3 border-b px-4 py-3 last:border-0 transition-colors hover:bg-muted/50 ${
                              !notif.isRead ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 ${config.color}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs leading-snug ${!notif.isRead ? "font-medium" : "text-muted-foreground"}`}>
                                {notif.message}
                              </p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {timeAgo(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-4 py-2">
                        <Link
                          to="/dashboard"
                          className="text-xs text-primary hover:underline"
                          onClick={() => setNotifOpen(false)}
                        >
                          View all in dashboard →
                        </Link>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ── User Avatar Dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {getInitials(user?.name || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{user?.name}</div>
                  <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user?.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings" className="flex items-center gap-2 cursor-pointer">
                      <List className="h-4 w-4" /> My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/requests" className="flex items-center gap-2 cursor-pointer">
                      <Tag className="h-4 w-4" /> Requests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="h-4 w-4" /> Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle className="h-4 w-4" /> Help
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <Link to="/browse" className="text-sm font-medium" onClick={() => setOpen(false)}>
              Browse
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/profile" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Profile
                </Link>
                <Link to="/my-listings" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  My Listings
                </Link>
                <Link to="/requests" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Requests
                </Link>
                <Link to="/messages" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Messages
                </Link>
              </>
            )}
            <div className="flex gap-2 pt-2">
              {isLoggedIn ? (
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Log Out
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)}>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;