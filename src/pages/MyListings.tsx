import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, MessageSquare, Pencil, Trash2, PackageOpen } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const tabs = ["Active", "Inactive", "Completed"] as const;
const typeBadgeVariant: Record<string, any> = { rent: "rent", sale: "sale", free: "free" };

const MyListings = () => {
  const [activeTab, setActiveTab] = useState<string>("Active");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/listings/my-listings");
      setListings(res.data.listings);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter((l) => l._id !== id));
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      await api.put(`/listings/${id}`, { isAvailable: !current });
      setListings(listings.map((l) =>
        l._id === id ? { ...l, isAvailable: !current } : l
      ));
      toast.success(`Listing marked as ${!current ? "active" : "inactive"}`);
    } catch {
      toast.error("Failed to update listing");
    }
  };

  const formatPrice = (listing: any) => {
    if (listing.pricingType === "free") return "Free";
    if (listing.pricingType === "rent") return `₹${listing.price}/day`;
    return `₹${listing.price}`;
  };

  // Filter by tab
  const filteredListings = listings.filter((l) => {
    if (activeTab === "Active") return l.isAvailable;
    if (activeTab === "Inactive") return !l.isAvailable;
    return false;
  });

  const stats = [
    { label: "Total Listings", value: listings.length },
    { label: "Active Now", value: listings.filter((l) => l.isAvailable).length },
    { label: "Requests Received", value: listings.reduce((sum, l) => sum + (l.requestsCount || 0), 0) },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Listings</h1>
          <p className="mt-1 text-muted-foreground">Manage your shared items</p>
        </div>
        <Link to="/add-listing">
          <Button><Plus className="h-4 w-4" /> Add New Listing</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-sm hover:-translate-y-0">
            <CardContent className="p-5 text-center">
              <p className="text-3xl font-bold text-primary">
                {loading ? "..." : s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Completed" ? (
        <div className="mt-16 flex flex-col items-center text-center text-muted-foreground">
          <PackageOpen className="h-16 w-16 stroke-1" />
          <p className="mt-4 text-lg font-medium">No completed listings yet.</p>
        </div>
      ) : loading ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center text-muted-foreground">
          <PackageOpen className="h-16 w-16 stroke-1" />
          <p className="mt-4 text-lg font-medium">No listings here yet.</p>
          {activeTab === "Active" && (
            <Link to="/add-listing" className="mt-4">
              <Button>+ Add Your First Listing</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((item) => (
            <Card key={item._id}>
              <div className="h-40 rounded-t-lg bg-muted overflow-hidden">
                {item.images?.[0] && (
                  <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold leading-tight">{item.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={typeBadgeVariant[item.pricingType]}>
                    {item.pricingType === "rent" ? "For Rent" : item.pricingType === "sale" ? "For Sale" : "Free"}
                  </Badge>
                  <Badge variant={item.isAvailable ? "available" : "secondary"}>
                    {item.isAvailable ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-primary">{formatPrice(item)}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{item.views} views</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{item.requestsCount} requests</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => handleToggleAvailability(item._id, item.isAvailable)}>
                    <Pencil className="h-3 w-3" /> {item.isAvailable ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(item._id)}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;