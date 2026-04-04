import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, ChevronRight, Lock, ArrowLeft } from "lucide-react";

const thumbnails = ["📘", "📖", "📕", "📗"];

const similarItems = [
  { title: "Data Structures & Algorithms", type: "sale" as const, typeLabel: "For Sale", price: "₹280", owner: "Karan D.", rating: 4.6, img: "📗" },
  { title: "Organic Chemistry (Morrison)", type: "rent" as const, typeLabel: "For Rent", price: "₹40/day", owner: "Ananya R.", rating: 4.7, img: "📕" },
  { title: "Physics Lab Manual", type: "free" as const, typeLabel: "Free", price: "Free", owner: "Divya N.", rating: 4.6, img: "📒" },
];

const reviews = [
  { name: "Sneha T.", rating: 5, date: "2 weeks ago", text: "Great condition book, exactly as described. Rahul was very responsive and flexible with timing." },
  { name: "Vikram P.", rating: 4, date: "1 month ago", text: "Good book, minor highlights on some pages but nothing distracting. Smooth borrowing experience overall." },
];

const ItemDetail = () => {
  const [activeThumb, setActiveThumb] = useState(0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Textbooks</span>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* LEFT — Image Gallery */}
          <div className="w-full lg:w-1/2">
            <div className="relative flex h-80 md:h-[400px] items-center justify-center rounded-xl bg-muted border">
              <span className="text-8xl">{thumbnails[activeThumb]}</span>
              <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">Condition: Good</Badge>
            </div>
            <div className="mt-3 flex gap-3">
              {thumbnails.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 bg-muted text-2xl transition-colors ${activeThumb === i ? "border-primary" : "border-transparent hover:border-muted-foreground/30"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="w-full space-y-6 lg:w-1/2">
            {/* Title & Badge */}
            <div>
              <h1 className="font-heading text-2xl font-bold md:text-3xl">Engineering Mathematics Vol. 2</h1>
              <div className="mt-2 flex items-center gap-3">
                <Badge variant="rent">For Rent</Badge>
                <span className="font-heading text-xl font-bold text-primary">₹60 / day</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              Well-maintained textbook covering Advanced Calculus, Differential Equations, and Linear Algebra. 
              Ideal for 2nd-year engineering students. Minor pencil annotations on a few pages, 
              otherwise in excellent reading condition.
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 rounded-lg border bg-card p-4">
              <div>
                <p className="text-xs text-muted-foreground">Author</p>
                <p className="text-sm font-medium">B.S. Grewal</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Edition</p>
                <p className="text-sm font-medium">44th Edition</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="text-sm font-medium">Good</p>
              </div>
            </div>

            {/* Owner Card */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  R
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold">Rahul Sharma</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>4.8 · 12 reviews</span>
                  </div>
                  <p className="text-xs text-muted-foreground">2nd Year, Computer Engineering</p>
                </div>
                <Link to="/profile" className="text-sm font-medium text-primary hover:underline">View Profile</Link>
              </CardContent>
            </Card>

            {/* Request Panel */}
            <Card className="border-primary/20">
              <CardContent className="space-y-4 p-5">
                <h3 className="font-heading text-lg font-semibold">Request to Borrow</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="from" className="text-xs">From Date</Label>
                    <Input id="from" type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="to" className="text-xs">To Date</Label>
                    <Input id="to" type="date" />
                  </div>
                </div>
                <p className="text-sm font-medium">Duration: 3 days — Total: <span className="text-primary">₹180</span></p>
                <Textarea placeholder="Add a note to the owner..." className="resize-none" rows={3} />
                <Button className="w-full">Send Request</Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Request only shared after owner accepts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Items */}
        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold mb-5">Similar Items</h2>
          <div className="flex gap-5 overflow-x-auto pb-2">
            {similarItems.map((item, i) => (
              <Card key={i} className="min-w-[260px] max-w-[300px] shrink-0 overflow-hidden">
                <div className="relative flex h-36 items-center justify-center bg-muted">
                  <span className="text-5xl">{item.img}</span>
                  <div className="absolute right-2 top-2">
                    <Badge variant={item.type} className="text-[11px]">{item.typeLabel}</Badge>
                  </div>
                </div>
                <CardContent className="space-y-2 p-4 pb-2">
                  <h3 className="font-heading text-sm font-semibold leading-snug">{item.title}</h3>
                  <p className="font-heading text-base font-bold">{item.price}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                    <span>· {item.owner}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2">
                  <Link to={`/item/${i + 100}`} className="w-full">
                    <Button className="w-full" size="sm">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-12 mb-8">
          <h2 className="font-heading text-xl font-bold mb-5">Reviews</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
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
        </section>
      </div>
    </div>
  );
};

export default ItemDetail;
