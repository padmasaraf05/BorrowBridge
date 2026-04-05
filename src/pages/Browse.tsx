import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const categories = ["Textbooks", "Lab Equipment", "Calculators", "Hostel Items", "Electronics", "Others"];
const categoryEmojis: Record<string, string> = {
  Textbooks: "📚", "Lab Equipment": "🧪", Calculators: "🖩",
  "Hostel Items": "🛏️", Electronics: "💻", Others: "🎒",
};

const Browse = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("newest");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12, sort };
      if (selectedCategories.length === 1) params.category = selectedCategories[0];
      if (selectedType !== "All") params.pricingType = selectedType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (availableOnly) params.available = true;

      const res = await api.get("/listings", { params });
      setListings(res.data.listings);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, sort]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchListings();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedType("All");
    setMinPrice("");
    setMaxPrice("");
    setAvailableOnly(false);
    setPage(1);
  };

  const getPricingBadge = (type: string) => {
    if (type === "rent") return "rent";
    if (type === "sale") return "sale";
    return "free";
  };

  const formatPrice = (listing: any) => {
    if (listing.pricingType === "free") return "Free";
    if (listing.pricingType === "rent") return `₹${listing.price}/day`;
    return `₹${listing.price}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-4 md:hidden">
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} w-full shrink-0 md:block md:w-64`}>
            <div className="rounded-lg border bg-card p-5">
              <div className="mb-3 flex justify-end md:hidden">
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold">Filters</h3>
                  <button className="text-sm text-primary hover:underline" onClick={handleClearFilters}>Clear All</button>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Category</Label>
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`cat-${cat}`}
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">
                        {categoryEmojis[cat]} {cat}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Listing Type</Label>
                  {["All", "rent", "sale", "free"].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <input type="radio" name="type" id={`type-${t}`}
                        checked={selectedType === t}
                        onChange={() => setSelectedType(t)}
                        className="h-4 w-4" />
                      <Label htmlFor={`type-${t}`} className="text-sm font-normal capitalize">{t}</Label>
                    </div>
                  ))}
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Price Range</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min ₹" className="h-9"
                      value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <span className="text-muted-foreground">–</span>
                    <Input type="number" placeholder="Max ₹" className="h-9"
                      value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                </div>

                {/* Available Only */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Available Only</Label>
                  <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
                </div>

                <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{total}</span> items
              </p>
              <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="top-rated">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-40 bg-muted" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((item) => (
                  <Card key={item._id} className="overflow-hidden">
                    <div className="relative flex h-40 items-center justify-center bg-muted">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title}
                          className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-5xl">
                          {categoryEmojis[item.category] || "📦"}
                        </span>
                      )}
                      <span className="absolute left-2 top-2 rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                        {item.category}
                      </span>
                      <div className="absolute right-2 top-2">
                        <Badge variant={getPricingBadge(item.pricingType) as any} className="text-[11px]">
                          {item.pricingType === "rent" ? "For Rent" : item.pricingType === "sale" ? "For Sale" : "Free"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="space-y-2 p-4 pb-2">
                      <h3 className="font-heading text-sm font-semibold leading-snug">{item.title}</h3>
                      <p className="font-heading text-base font-bold">{formatPrice(item)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {item.owner?.name?.charAt(0) || "U"}
                        </div>
                        <span>{item.owner?.name || "Unknown"}</span>
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{item.owner?.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2">
                      <Link to={`/item/${item._id}`} className="w-full">
                        <Button className="w-full" size="sm">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="secondary" size="sm" disabled={page === 1}
                  onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
                <Button variant="secondary" size="sm" disabled={page === pages}
                  onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Browse;