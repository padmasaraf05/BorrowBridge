import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, ArrowRight, Eye, Rocket, Upload, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [pricingType, setPricingType] = useState<PricingType>("free");
  const [price, setPrice] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const typeLabel = pricingType === "rent" ? "For Rent" : pricingType === "sale" ? "For Sale" : "Free";
  const badgeVariant = pricingType === "rent" ? "rent" : pricingType === "sale" ? "sale" : "free";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - images.length;
    const newFiles = files.slice(0, remaining);
    setImages([...images, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title || !category || !condition || !description) {
      toast.error("Please fill in all item details first");
      return;
    }
    if (pricingType !== "free" && !price) {
      toast.error("Please enter a price");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("description", description);
      formData.append("pricingType", pricingType);
      formData.append("price", pricingType === "free" ? "0" : price);
      if (availableFrom) formData.append("availableFrom", availableFrom);
      if (availableTo) formData.append("availableTo", availableTo);
      images.forEach((img) => formData.append("images", img));

      await api.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Listing published successfully! 🚀");
      navigate("/my-listings");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish listing");
    } finally {
      setLoading(false);
    }
  };

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
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "border-2 border-muted-foreground/30 text-muted-foreground"
                }`}>{i + 1}</div>
                <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
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
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-10 text-center transition-colors hover:border-primary/50 cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-heading font-semibold">Drag photos here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Up to 5 images. JPG or PNG only.</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>

              <div className="grid grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={src} alt="" className="h-full w-full rounded-lg object-cover border" />
                    <button onClick={() => removeImage(i)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: 5 - previews.length }).map((_, i) => (
                  <label key={i} className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary">
                    <Plus className="h-5 w-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)}>Next <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
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
                <Input id="title" placeholder="e.g. Engineering Mathematics Vol. 2"
                  value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="Describe your item…" rows={4} className="resize-none"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
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
              <div className="grid grid-cols-3 gap-3">
                {pricingOptions.map((opt) => (
                  <button key={opt.key} onClick={() => setPricingType(opt.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                      pricingType === opt.key ? "border-primary bg-primary/5 shadow-sm" : "border-muted-foreground/20 hover:border-muted-foreground/40"
                    }`}>
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                  </button>
                ))}
              </div>
              {pricingType !== "free" && (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {pricingType === "rent" ? "Price per day (₹)" : "Selling price (₹)"}
                  </Label>
                  <Input id="price" type="number" placeholder="e.g. 60"
                    value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="avail-from" className="text-xs">Available From</Label>
                  <Input id="avail-from" type="date"
                    value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avail-to" className="text-xs">Available Until</Label>
                  <Input id="avail-to" type="date"
                    value={availableTo} onChange={(e) => setAvailableTo(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={() => setStep(1)} className="sm:w-auto">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <div className="flex flex-1 gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="mr-1.5 h-4 w-4" /> Preview
                  </Button>
                  <Button className="flex-1" onClick={handlePublish} disabled={loading}>
                    <Rocket className="mr-1.5 h-4 w-4" />
                    {loading ? "Publishing..." : "Publish Listing"}
                  </Button>
                </div>
              </div>
              {showPreview && (
                <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Listing Preview</p>
                  <div className="flex gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-4xl">
                      {previews[0] ? <img src={previews[0]} className="h-full w-full rounded-lg object-cover" /> : "📦"}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-heading font-semibold truncate">{title || "Untitled Item"}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariant as any} className="text-[11px]">{typeLabel}</Badge>
                        {category && <span className="text-xs text-muted-foreground">{category}</span>}
                      </div>
                      <p className="font-heading font-bold text-primary">
                        {pricingType === "free" ? "Free" : pricingType === "rent" ? `₹${price || "0"}/day` : `₹${price || "0"}`}
                      </p>
                    </div>
                  </div>
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