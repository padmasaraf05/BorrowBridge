import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Star, Eye, MessageSquare, Pencil, Trash2, Share2 } from "lucide-react";

const myListings = [
  { id: 1, title: "Engineering Mathematics Vol. 2", type: "rent" as const, price: "₹60/day", views: 24, requests: 3 },
  { id: 2, title: "Scientific Calculator (Casio fx-991)", type: "sale" as const, price: "₹450", views: 38, requests: 5 },
  { id: 3, title: "Arduino Starter Kit", type: "free" as const, price: "Free", views: 15, requests: 1 },
];

const reviews = [
  { id: 1, name: "Sneha Desai", initials: "SD", rating: 5, text: "Arjun was super punctual and the textbook was in great condition. Highly recommend borrowing from him!", date: "March 2025", item: "Physics Lab Manual" },
  { id: 2, name: "Rahul Sharma", initials: "RS", rating: 4, text: "Good experience overall. The calculator worked perfectly for my exams.", date: "February 2025", item: "Scientific Calculator" },
  { id: 3, name: "Priya Patel", initials: "PP", rating: 5, text: "Very responsive and flexible with pickup times. Would borrow again!", date: "January 2025", item: "Engineering Drawing Kit" },
];

const typeBadgeVariant = { rent: "rent" as const, sale: "sale" as const, free: "free" as const };
const typeLabel = { rent: "For Rent", sale: "For Sale", free: "Free" };

const Profile = () => {
  const [tab, setTab] = useState<"listings" | "reviews">("listings");
  const [form, setForm] = useState({
    name: "Arjun Patel",
    email: "arjun.patel@college.edu",
    phone: "",
    branch: "Mechanical Engineering",
    year: "3rd Year",
    college: "IIT Bombay",
    showEmail: true,
    showPhone: false,
  });

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Profile Card */}
      <Card className="hover:-translate-y-0">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">AP</AvatarFallback>
            </Avatar>
          </div>
          <button className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
            <Camera className="h-3 w-3" /> Change Photo
          </button>
          <h1 className="mt-3 font-heading text-2xl font-bold">Arjun Patel</h1>
          <p className="mt-1 text-sm text-muted-foreground">3rd Year · Mechanical Engineering</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 4.7 out of 5 · 18 reviews
          </p>
          <Badge variant="available" className="mt-3">✓ Verified Student</Badge>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm"><Pencil className="h-3 w-3" /> Edit Profile</Button>
            <Button variant="outline" size="sm"><Share2 className="h-3 w-3" /> Share Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Editable Info Form */}
      <Card className="mt-6 hover:-translate-y-0">
        <CardContent className="p-6">
          <h2 className="font-heading text-lg font-semibold">Personal Info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">College Email</Label>
              <Input id="email" className="mt-1 bg-muted" value={form.email} readOnly />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" className="mt-1" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>

          <h2 className="mt-8 font-heading text-lg font-semibold">Academic Info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" className="mt-1" value={form.branch} onChange={(e) => update("branch", e.target.value)} />
            </div>
            <div>
              <Label>Year</Label>
              <Select value={form.year} onValueChange={(v) => update("year", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="college">College Name</Label>
              <Input id="college" className="mt-1" value={form.college} onChange={(e) => update("college", e.target.value)} />
            </div>
          </div>

          <h2 className="mt-8 font-heading text-lg font-semibold">Contact Preferences</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show email to other users</Label>
              <Switch checked={form.showEmail} onCheckedChange={(v) => update("showEmail", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show phone number</Label>
              <Switch checked={form.showPhone} onCheckedChange={(v) => update("showPhone", v)} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b">
        {([["listings", "My Listings"], ["reviews", "Reviews Received"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium transition-colors ${tab === key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((item) => (
            <Card key={item.id}>
              <div className="h-40 rounded-t-lg bg-muted" />
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold leading-tight">{item.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={typeBadgeVariant[item.type]}>{typeLabel[item.type]}</Badge>
                  <Badge variant="available">Active</Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-primary">{item.price}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{item.views} views</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{item.requests} requests</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"><Pencil className="h-3 w-3" /> Edit</Button>
                  <Button variant="outline" size="sm" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="hover:-translate-y-0">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">{r.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="mt-0.5 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">For: {r.item}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
