import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, ChevronRight, Lock } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";

const categoryEmojis: Record<string, string> = {
  Textbooks: "📚", "Lab Equipment": "🧪", Calculators: "🖩",
  "Hostel Items": "🛏️", Electronics: "💻", Others: "🎒",
};

const ItemDetail = () => {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [activeThumb, setActiveThumb] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/reviews/listing/${id}`),
        ]);
        setListing(listingRes.data.listing);
        setReviews(reviewsRes.data.reviews);

        // Fetch similar items by same category
        const similarRes = await api.get("/listings", {
          params: { category: listingRes.data.listing.category, limit: 3 },
        });
        setSimilarItems(
          similarRes.data.listings.filter((l: any) => l._id !== id)
        );
      } catch {
        toast.error("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Calculate duration and total price
  const getDuration = () => {
    if (!fromDate || !toDate) return 0;
    const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getTotalPrice = () => {
    if (!listing) return 0;
    const days = getDuration();
    if (listing.pricingType === "rent") return listing.price * days;
    if (listing.pricingType === "sale") return listing.price;
    return 0;
  };

const handleSendRequest = async () => {
  if (!isLoggedIn) {
    toast.error("Please login to send a request");
    return;
  }

  // Only require dates for rental items
  if (listing.pricingType === "rent" && (!fromDate || !toDate)) {
    toast.error("Please select rental dates");
    return;
  }

  setRequesting(true);
  try {
    const payload: any = {
      listingId: id,
      message,
    };

    // Only add dates for rent items
    if (listing.pricingType === "rent") {
      payload.fromDate = fromDate;
      payload.toDate = toDate;
    }

    await api.post("/requests", payload);
    toast.success("Request sent successfully! 🎉");
    setFromDate("");
    setToDate("");
    setMessage("");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to send request");
  } finally {
    setRequesting(false);
  }
};
  const formatPrice = () => {
    if (!listing) return "";
    if (listing.pricingType === "free") return "Free";
    if (listing.pricingType === "rent") return `₹${listing.price} / day`;
    return `₹${listing.price}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Listing not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{listing.category}</span>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* LEFT — Images */}
          <div className="w-full lg:w-1/2">
            <div className="relative flex h-80 md:h-[400px] items-center justify-center rounded-xl bg-muted border overflow-hidden">
              {listing.images?.[activeThumb] ? (
                <img src={listing.images[activeThumb]} alt={listing.title}
                  className="h-full w-full object-cover" />
              ) : (
                <span className="text-8xl">{categoryEmojis[listing.category] || "📦"}</span>
              )}
              <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
                Condition: {listing.condition}
              </Badge>
            </div>
            {listing.images?.length > 1 && (
              <div className="mt-3 flex gap-3">
                {listing.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveThumb(i)}
                    className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 bg-muted overflow-hidden transition-colors ${
                      activeThumb === i ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                    }`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="w-full space-y-6 lg:w-1/2">
            <div>
              <h1 className="font-heading text-2xl font-bold md:text-3xl">{listing.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                <Badge variant={listing.pricingType as any}>
                  {listing.pricingType === "rent" ? "For Rent" : listing.pricingType === "sale" ? "For Sale" : "Free"}
                </Badge>
                <span className="font-heading text-xl font-bold text-primary">{formatPrice()}</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>

            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4">
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{listing.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="text-sm font-medium">{listing.condition}</p>
              </div>
            </div>

            {/* Owner Card */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {listing.owner?.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold">{listing.owner?.name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{listing.owner?.rating?.toFixed(1) || "0.0"} · {listing.owner?.totalReviews || 0} reviews</span>
                  </div>
                  {listing.owner?.branch && (
                    <p className="text-xs text-muted-foreground">
                      {listing.owner.year && `Year ${listing.owner.year}, `}{listing.owner.branch}
                    </p>
                  )}
                </div>
                <Link to={`/users/${listing.owner?._id}`}
                  className="text-sm font-medium text-primary hover:underline">
                  View Profile
                </Link>
              </CardContent>
            </Card>

            {/* Request Panel */}
            {listing.owner?._id !== user?._id && (
              <Card className="border-primary/20">
                <CardContent className="space-y-4 p-5">
                  <h3 className="font-heading text-lg font-semibold">
                    {listing.pricingType === "sale" ? "Request to Buy" : listing.pricingType === "free" ? "Request Item" : "Request to Borrow"}
                  </h3>
                  {listing.pricingType !== "sale" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="from" className="text-xs">From Date</Label>
                        <Input id="from" type="date" value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="to" className="text-xs">To Date</Label>
                        <Input id="to" type="date" value={toDate}
                          onChange={(e) => setToDate(e.target.value)} />
                      </div>
                    </div>
                  )}
                  {getDuration() > 0 && listing.pricingType === "rent" && (
                    <p className="text-sm font-medium">
                      Duration: {getDuration()} days — Total:{" "}
                      <span className="text-primary">₹{getTotalPrice()}</span>
                    </p>
                  )}
                  <Textarea placeholder="Add a note to the owner..." className="resize-none"
                    rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
                  <Button className="w-full" onClick={handleSendRequest} disabled={requesting}>
                    {requesting ? "Sending..." : "Send Request"}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" /> Request only shared after owner accepts
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Items */}
        {similarItems.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-bold mb-5">Similar Items</h2>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {similarItems.map((item: any) => (
                <Card key={item._id} className="min-w-[260px] max-w-[300px] shrink-0 overflow-hidden">
                  <div className="relative flex h-36 items-center justify-center bg-muted">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl">{categoryEmojis[item.category] || "📦"}</span>
                    )}
                    <div className="absolute right-2 top-2">
                      <Badge variant={item.pricingType as any} className="text-[11px]">
                        {item.pricingType === "rent" ? "For Rent" : item.pricingType === "sale" ? "For Sale" : "Free"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="space-y-2 p-4 pb-2">
                    <h3 className="font-heading text-sm font-semibold leading-snug">{item.title}</h3>
                    <p className="font-heading text-base font-bold">
                      {item.pricingType === "free" ? "Free" : item.pricingType === "rent" ? `₹${item.price}/day` : `₹${item.price}`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{item.owner?.rating?.toFixed(1) || "0.0"}</span>
                      <span>· {item.owner?.name}</span>
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
          </section>
        )}

        {/* Reviews */}
        <section className="mt-12 mb-8">
          <h2 className="font-heading text-xl font-bold mb-5">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet for this listing.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((r: any) => (
                <Card key={r._id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {r.reviewer?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.reviewer?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ItemDetail;