import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Bell, LayoutDashboard, User, List, Star, HelpCircle, LogOut } from "lucide-react";
import BorrowBridgeLogo from "@/components/BorrowBridgeLogo";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <BorrowBridgeLogo size={36} showText={true} className="flex-row gap-2" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/browse" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Browse</Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/dashboard" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
            <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
              3
            </Badge>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">AP</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4" /> Reviews
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <HelpCircle className="h-4 w-4" /> Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/login" className="flex items-center gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" /> Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <Link to="/browse" className="text-sm font-medium" onClick={() => setOpen(false)}>Browse</Link>
            <Link to="/dashboard" className="text-sm font-medium" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link to="/profile" className="text-sm font-medium" onClick={() => setOpen(false)}>Profile</Link>
            <Link to="/my-listings" className="text-sm font-medium" onClick={() => setOpen(false)}>My Listings</Link>
            <Link to="/messages" className="text-sm font-medium" onClick={() => setOpen(false)}>Messages</Link>
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)}><Button variant="secondary" size="sm">Log Out</Button></Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
