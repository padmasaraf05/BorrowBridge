import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, MessageSquare, Pencil, Trash2, PackageOpen } from "lucide-react";

const listings = [
  { id: 1, title: "Engineering Mathematics Vol. 2", type: "rent" as const, price: "₹60/day", views: 24, requests: 3 },
  { id: 2, title: "Scientific Calculator (Casio fx-991)", type: "sale" as const, price: "₹450", views: 38, requests: 5 },
  { id: 3, title: "Arduino Starter Kit", type: "rent" as const, price: "₹80/day", views: 15, requests: 1 },
  { id: 4, title: "Desk Lamp (LED, Adjustable)", type: "free" as const, price: "Free", views: 42, requests: 2 },
  { id: 5, title: "Data Structures & Algorithms Textbook", type: "rent" as const, price: "₹40/day", views: 19, requests: 0 },
  { id: 6, title: "Lab Coat (Size M)", type: "sale" as const, price: "₹200", views: 11, requests: 0 },
];

const stats = [
  { label: "Total Listings", value: 6 },
  { label: "Active Now", value: 4 },
  { label: "Requests Received", value: 11 },
];

const tabs = ["Active", "Inactive", "Completed"] as const;

const typeBadgeVariant = { rent: "rent" as const, sale: "sale" as const, free: "free" as const };

const MyListings = () => {
  const [activeTab, setActiveTab] = useState<string>("Active");

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
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Active" ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <Card key={item.id}>
              <div className="h-40 rounded-t-lg bg-muted" />
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold leading-tight">{item.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={typeBadgeVariant[item.type]}>
                    {item.type === "rent" ? "For Rent" : item.type === "sale" ? "For Sale" : "Free"}
                  </Badge>
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
        <div className="mt-16 flex flex-col items-center text-center text-muted-foreground">
          <PackageOpen className="h-16 w-16 stroke-1" />
          <p className="mt-4 text-lg font-medium">No listings here yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyListings;
