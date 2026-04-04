import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, ArrowRight, Eye, Rocket, Upload } from "lucide-react";

const steps = ["Upload Photos", "Item Details", "Pricing & Publish"];

const categories = ["Textbooks", "Lab Equipment", "Calculators", "Hostel Items", "Electronics", "Others"];
const conditions = ["Like New", "Good", "Fair", "Worn"];

const pricingOptions = [
  { key: "free", emoji: "🆓", label: "Free", description: "Give it away" },
  { key: "rent", emoji: "📅", label: "For Rent", description: "Per day pricing" },
  { key: "sale", emoji: "💰", label: "For Sale", description: "One-time price" },
] as const;

type PricingType = "free" | "rent" | "sale";

const AddListing = () => {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [pricingType, setPricingType] = useState<PricingType>("free");
  const [price, setPrice] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const typeLabel = pricingType === "rent" ? "For Rent" : pricingType === "sale" ? "For Sale" : "Free";
  const badgeVariant = pricingType === "rent" ? "rent" : pricingType === "sale" ? "sale" : "free";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto max-w-2xl px-4 py-6 md:py-10">
        <h1 className="font-heading text-2xl font-bold text-center md:text-3xl">List an Item</h1>
        <p className="text-center text-sm text-muted-foreground mt-1 mb-8">Share something with your campus community</p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    i <= step
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 h-0.5 w-10 sm:w-16 rounded ${i < step ? "bg-primary" : "bg-muted-foreground/20"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Upload Photos */}
        {step === 0 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-10 text-center transition-colors hover:border-primary/50">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-heading font-semibold">Drag photos here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Up to 5 images. JPG or PNG only.</p>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)}>
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Item Details */}
        {step === 1 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title</Label>
                <Input id="title" placeholder="e.g. Engineering Mathematics Vol. 2" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="Describe your item — condition, usage, any extras…" rows={4} className="resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(2)}>
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Pricing & Publish */}
        {step === 2 && (
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Pricing toggle cards */}
              <div className="grid grid-cols-3 gap-3">
                {pricingOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setPricingType(opt.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                      pricingType === opt.key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted-foreground/20 hover:border-muted-foreground/40"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                  </button>
                ))}
              </div>

              {/* Price input (only for rent/sale) */}
              {pricingType !== "free" && (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {pricingType === "rent" ? "Price per day (₹)" : "Selling price (₹)"}
                  </Label>
                  <Input id="price" type="number" placeholder="e.g. 60" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              )}

              {/* Availability dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="avail-from" className="text-xs">Available From</Label>
                  <Input id="avail-from" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avail-to" className="text-xs">Available Until</Label>
                  <Input id="avail-to" type="date" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={() => setStep(1)} className="sm:w-auto">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <div className="flex flex-1 gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="mr-1.5 h-4 w-4" /> Preview Listing
                  </Button>
                  <Button variant="success" className="flex-1">
                    <Rocket className="mr-1.5 h-4 w-4" /> Publish Listing
                  </Button>
                </div>
              </div>

              {/* Preview Card */}
              {showPreview && (
                <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Listing Preview</p>
                  <div className="flex gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-4xl">📦</div>
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-heading font-semibold truncate">{title || "Untitled Item"}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariant as any} className="text-[11px]">{typeLabel}</Badge>
                        {category && <span className="text-xs text-muted-foreground">{category}</span>}
                      </div>
                      <p className="font-heading font-bold text-primary">
                        {pricingType === "free" ? "Free" : pricingType === "rent" ? `₹${price || "0"}/day` : `₹${price || "0"}`}
                      </p>
                      {condition && <p className="text-xs text-muted-foreground">Condition: {condition}</p>}
                    </div>
                  </div>
                  {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddListing;
