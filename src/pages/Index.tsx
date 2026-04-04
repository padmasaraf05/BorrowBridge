import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BorrowBridgeLogo from "@/components/BorrowBridgeLogo";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";

const categories = [
  { emoji: "📚", label: "Textbooks" },
  { emoji: "🧪", label: "Lab Equipment" },
  { emoji: "🖩", label: "Calculators" },
  { emoji: "🛏️", label: "Hostel Items" },
  { emoji: "💻", label: "Electronics" },
  { emoji: "🎒", label: "Others" },
];

const listings = [
  { title: "Engineering Mathematics Textbook", badge: "rent" as const, badgeLabel: "For Rent", price: "₹50/day", owner: "Aditya S.", rating: 4.8, img: "📘" },
  { title: "Scientific Calculator (Casio fx-991)", badge: "sale" as const, badgeLabel: "For Sale", price: "₹400", owner: "Priya M.", rating: 4.9, img: "🖩" },
  { title: "Lab Coat (Chemistry)", badge: "free" as const, badgeLabel: "Free", price: "Free", owner: "Ravi K.", rating: 4.5, img: "🥼" },
  { title: "USB-C Hub Adapter", badge: "rent" as const, badgeLabel: "For Rent", price: "₹30/day", owner: "Sneha T.", rating: 4.7, img: "🔌" },
  { title: "Data Structures & Algorithms Book", badge: "sale" as const, badgeLabel: "For Sale", price: "₹250", owner: "Karan D.", rating: 4.6, img: "📗" },
  { title: "Desk Lamp (LED)", badge: "free" as const, badgeLabel: "Free", price: "Free", owner: "Meera J.", rating: 4.4, img: "💡" },
];

const Index = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Borrow. Share. Save.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The trusted marketplace for college students to share textbooks, equipment, and more.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/browse">
            <Button size="lg">Browse Items</Button>
          </Link>
          <Link to="/add-listing">
            <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              List an Item
            </Button>
          </Link>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <CheckCircle className="h-4 w-4" /> College Verified Platform
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-center text-2xl font-bold md:text-3xl">Browse by Category</h2>
        <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to="/browse"
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Listings */}
    <section className="bg-muted/40 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-center text-2xl font-bold md:text-3xl">Recently Listed</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex h-32 items-center justify-center rounded-md bg-muted text-5xl">
                  {item.img}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                  <Badge variant={item.badge} className="shrink-0">{item.badgeLabel}</Badge>
                </div>
                <p className="font-heading text-lg font-semibold">{item.price}</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{item.owner}</span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{item.rating}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/item/${i + 1}`} className="w-full">
                  <Button variant="secondary" className="w-full" size="sm">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section id="how-it-works" className="py-14 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">How It Works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { step: "1", emoji: "📝", title: "List Your Item", desc: "Post what you want to lend, rent, or sell in seconds." },
            { step: "2", emoji: "🔍", title: "Browse & Request", desc: "Find what you need and message the owner directly." },
            { step: "3", emoji: "🤝", title: "Meet & Exchange", desc: "Coordinate a campus meetup and complete the exchange." },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-3">
              <span className="text-4xl">{s.emoji}</span>
              <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t bg-muted/30 py-10">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <div className="flex items-center gap-2">
            <BorrowBridgeLogo size={32} showText={true} className="flex-row gap-1" />
          </div>
          <p className="text-sm text-muted-foreground">Share more. Spend less.</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="#" className="hover:text-foreground">About</Link>
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <Link to="#" className="hover:text-foreground">Contact</Link>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 BorrowBridge. Made for students.</p>
      </div>
    </footer>
  </div>
);

export default Index;
