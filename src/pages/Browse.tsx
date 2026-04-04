import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";

const categories = ["Textbooks", "Lab Equipment", "Calculators", "Hostel Items", "Electronics", "Others"];

const listingTypes = ["All", "For Rent", "For Sale", "Free"] as const;

const items = [
  { title: "Engineering Mathematics (Vol. 1)", category: "Textbooks", type: "rent" as const, typeLabel: "For Rent", price: "₹50/day", owner: "Aditya S.", rating: 4.8, img: "📘" },
  { title: "Casio fx-991EX Calculator", category: "Calculators", type: "sale" as const, typeLabel: "For Sale", price: "₹450", owner: "Priya M.", rating: 4.9, img: "🖩" },
  { title: "Lab Coat (White, M)", category: "Lab Equipment", type: "free" as const, typeLabel: "Free", price: "Free", owner: "Ravi K.", rating: 4.5, img: "🥼" },
  { title: "USB-C Hub 7-in-1", category: "Electronics", type: "rent" as const, typeLabel: "For Rent", price: "₹30/day", owner: "Sneha T.", rating: 4.7, img: "🔌" },
  { title: "Data Structures & Algorithms", category: "Textbooks", type: "sale" as const, typeLabel: "For Sale", price: "₹280", owner: "Karan D.", rating: 4.6, img: "📗" },
  { title: "LED Desk Lamp", category: "Hostel Items", type: "free" as const, typeLabel: "Free", price: "Free", owner: "Meera J.", rating: 4.4, img: "💡" },
  { title: "Arduino Uno Starter Kit", category: "Electronics", type: "rent" as const, typeLabel: "For Rent", price: "₹80/day", owner: "Vikram P.", rating: 4.9, img: "🔧" },
  { title: "Organic Chemistry (Morrison & Boyd)", category: "Textbooks", type: "sale" as const, typeLabel: "For Sale", price: "₹320", owner: "Ananya R.", rating: 4.7, img: "📕" },
  { title: "Extension Board (4-socket)", category: "Hostel Items", type: "rent" as const, typeLabel: "For Rent", price: "₹20/day", owner: "Rohan G.", rating: 4.3, img: "🔌" },
  { title: "Physics Lab Manual", category: "Lab Equipment", type: "free" as const, typeLabel: "Free", price: "Free", owner: "Divya N.", rating: 4.6, img: "📒" },
  { title: "Wireless Mouse (Logitech)", category: "Electronics", type: "sale" as const, typeLabel: "For Sale", price: "₹500", owner: "Arjun B.", rating: 4.8, img: "🖱️" },
  { title: "Mattress Topper", category: "Hostel Items", type: "rent" as const, typeLabel: "For Rent", price: "₹100/week", owner: "Neha S.", rating: 4.2, img: "🛏️" },
];

const categoryEmojis: Record<string, string> = {
  Textbooks: "📚", "Lab Equipment": "🧪", Calculators: "🖩",
  "Hostel Items": "🛏️", Electronics: "💻", Others: "🎒",
};

const Browse = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  const Filters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">Filters</h3>
        <button className="text-sm text-primary hover:underline">Clear All</button>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Category</Label>
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <Checkbox id={`cat-${cat}`} />
            <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">{categoryEmojis[cat]} {cat}</Label>
          </div>
        ))}
      </div>

      {/* Listing Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Listing Type</Label>
        {listingTypes.map((t) => (
          <div key={t} className="flex items-center gap-2">
            <input
              type="radio"
              name="listingType"
              id={`type-${t}`}
              checked={selectedType === t}
              onChange={() => setSelectedType(t)}
              className="h-4 w-4 accent-[hsl(175,84%,32%)]"
            />
            <Label htmlFor={`type-${t}`} className="text-sm font-normal">{t}</Label>
          </div>
        ))}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Min ₹" className="h-9" />
          <span className="text-muted-foreground">–</span>
          <Input type="number" placeholder="Max ₹" className="h-9" />
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Available Only</Label>
        <Switch />
      </div>

      <Button className="w-full">Apply Filters</Button>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Mobile filter toggle */}
        <div className="mb-4 md:hidden">
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop always visible, Mobile toggled */}
          <aside className={`${showFilters ? "block" : "hidden"} w-full shrink-0 md:block md:w-64`}>
            <div className="rounded-lg border bg-card p-5">
              {/* Mobile close */}
              <div className="mb-3 flex justify-end md:hidden">
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
              <Filters />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Top bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Showing <span className="font-medium text-foreground">24</span> items</p>
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="top-rated">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <Card key={i} className="overflow-hidden">
                  {/* Image area */}
                  <div className="relative flex h-40 items-center justify-center bg-muted">
                    <span className="text-5xl">{item.img}</span>
                    {/* Category badge top-left */}
                    <span className="absolute left-2 top-2 rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                      {item.category}
                    </span>
                    {/* Type badge top-right */}
                    <div className="absolute right-2 top-2">
                      <Badge variant={item.type} className="text-[11px]">{item.typeLabel}</Badge>
                    </div>
                  </div>

                  <CardContent className="space-y-2 p-4 pb-2">
                    <h3 className="font-heading text-sm font-semibold leading-snug">{item.title}</h3>
                    <p className="font-heading text-base font-bold">{item.price}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {item.owner.charAt(0)}
                      </div>
                      <span>{item.owner}</span>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-2">
                    <Link to={`/item/${i + 1}`} className="w-full">
                      <Button className="w-full" size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page 1 of 3</span>
              <Button variant="secondary" size="sm">
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Browse;
