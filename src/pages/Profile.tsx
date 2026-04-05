import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Star, Eye, MessageSquare, Pencil, Trash2, Share2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { toast } from "sonner";

const typeBadgeVariant = { rent: "rent" as const, sale: "sale" as const, free: "free" as const };
const typeLabel: Record<string, string> = { rent: "For Rent", sale: "For Sale", free: "Free" };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<"listings" | "reviews">("listings");
  const [myListings, setMyListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    college: "",
    showEmail: false,
    showPhone: false,
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        branch: user.branch || "",
        year: user.year || "",
        college: user.college || "",
        showEmail: user.showEmail || false,
        showPhone: user.showPhone || false,
      });
    }
  }, [user]);

  // Fetch listings and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, reviewsRes] = await Promise.all([
          api.get("/listings/my-listings"),
          api.get(`/reviews/user/${user?._id}`),
        ]);
        setMyListings(listingsRes.data.listings);
        setReviews(reviewsRes.data.reviews);
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };
    if (user?._id) fetchData();
  }, [user]);

  const update = (key: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile", {
        name: form.name,
        phone: form.phone,
        branch: form.branch,
        year: form.year,
        college: form.college,
        showEmail: form.showEmail,
        showPhone: form.showPhone,
      });
      updateUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/listings/${id}`);
      setMyListings(myListings.filter((l) => l._id !== id));
      toast.success("Listing deleted successfully");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const formatPrice = (listing: any) => {
    if (listing.pricingType === "free") return "Free";
    if (listing.pricingType === "rent") return `₹${listing.price}/day`;
    return `₹${listing.price}`;
  };

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const timeAgo = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Profile Card */}
      <Card className="hover:-translate-y-0">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <Avatar className="h-24 w-24">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                {getInitials(user?.name || "")}
              </AvatarFallback>
            )}
          </Avatar>
          <button className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
            <Camera className="h-3 w-3" /> Change Photo
          </button>
          <h1 className="mt-3 font-heading text-2xl font-bold">{user?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.year ? `Year ${user.year}` : ""}{user?.branch ? ` · ${user.branch}` : ""}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {user?.rating?.toFixed(1) || "0.0"} out of 5 · {user?.totalReviews || 0} reviews
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
              <Input id="name" className="mt-1" value={form.name}
                onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">College Email</Label>
              <Input id="email" className="mt-1 bg-muted" value={form.email} readOnly />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" className="mt-1" placeholder="+91 98765 43210"
                value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>

          <h2 className="mt-8 font-heading text-lg font-semibold">Academic Info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" className="mt-1" value={form.branch}
                onChange={(e) => update("branch", e.target.value)} />
            </div>
            <div>
              <Label>Year</Label>
              <Select value={form.year} onValueChange={(v) => update("year", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4"].map((y) => (
                    <SelectItem key={y} value={y}>{y}{y === "1" ? "st" : y === "2" ? "nd" : y === "3" ? "rd" : "th"} Year</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="college">College Name</Label>
              <Input id="college" className="mt-1" value={form.college}
                onChange={(e) => update("college", e.target.value)} />
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b">
        {([["listings", "My Listings"], ["reviews", "Reviews Received"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium transition-colors ${tab === key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.length === 0 ? (
            <p className="text-muted-foreground col-span-3 text-center py-8">No listings yet.</p>
          ) : myListings.map((item) => (
            <Card key={item._id}>
              <div className="h-40 rounded-t-lg bg-muted overflow-hidden">
                {item.images?.[0] && (
                  <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold leading-tight">{item.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={typeBadgeVariant[item.pricingType as keyof typeof typeBadgeVariant]}>
                    {typeLabel[item.pricingType]}
                  </Badge>
                  <Badge variant="available">Active</Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-primary">{formatPrice(item)}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{item.views} views</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{item.requestsCount} requests</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"><Pencil className="h-3 w-3" /> Edit</Button>
                  <Button variant="outline" size="sm"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteListing(item._id)}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews received yet.</p>
          ) : reviews.map((r: any) => (
            <Card key={r._id} className="hover:-translate-y-0">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                      {getInitials(r.reviewer?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.reviewer?.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="mt-0.5 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">For: {r.listing?.title}</p>
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