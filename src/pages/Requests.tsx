import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, PackageOpen } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";

const tabs = ["Incoming", "Outgoing"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const RequestCard = ({
  request,
  type,
  onAccept,
  onDecline,
  onCancel,
}: {
  request: any;
  type: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
}) => {
  const otherUser = type === "incoming" ? request.requester : request.owner;
  const getInitials = (name: string) =>
    name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Item image */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
            {request.listing?.images?.[0] ? (
              <img src={request.listing.images[0]} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : "📦"}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading font-semibold leading-tight">
                {request.listing?.title || "Item"}
              </h3>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[request.status]}`}>
                {request.status}
              </span>
            </div>

            {/* Other user info */}
            <div className="mt-1 flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                  {getInitials(otherUser?.name || "")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {type === "incoming" ? "From" : "To"}: {otherUser?.name}
              </span>
            </div>

            {/* Dates */}
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDate(request.fromDate)} → {formatDate(request.toDate)}
              {request.duration > 0 && ` (${request.duration} days)`}
            </div>

            {/* Price */}
            {request.totalPrice > 0 && (
              <p className="mt-1 text-sm font-medium text-primary">
                Total: ₹{request.totalPrice}
              </p>
            )}

            {/* Message */}
            {request.message && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                "{request.message}"
              </p>
            )}

            {/* Actions */}
            {type === "incoming" && request.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="gap-1"
                  onClick={() => onAccept?.(request._id)}>
                  <CheckCircle className="h-3.5 w-3.5" /> Accept
                </Button>
                <Button size="sm" variant="outline"
                  className="gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDecline?.(request._id)}>
                  <XCircle className="h-3.5 w-3.5" /> Decline
                </Button>
              </div>
            )}

            {type === "outgoing" && request.status === "pending" && (
              <div className="mt-3">
                <Button size="sm" variant="outline"
                  className="gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onCancel?.(request._id)}>
                  <XCircle className="h-3.5 w-3.5" /> Cancel Request
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Requests = () => {
  const [activeTab, setActiveTab] = useState<"Incoming" | "Outgoing">("Incoming");
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [inRes, outRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing"),
      ]);
      setIncoming(inRes.data.requests);
      setOutgoing(outRes.data.requests);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.put(`/requests/${id}`, { status: "accepted" });
      setIncoming(incoming.map((r) =>
        r._id === id ? { ...r, status: "accepted" } : r
      ));
      toast.success("Request accepted! ✅");
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.put(`/requests/${id}`, { status: "declined" });
      setIncoming(incoming.map((r) =>
        r._id === id ? { ...r, status: "declined" } : r
      ));
      toast.success("Request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/requests/${id}`);
      setOutgoing(outgoing.map((r) =>
        r._id === id ? { ...r, status: "cancelled" } : r
      ));
      toast.success("Request cancelled");
    } catch {
      toast.error("Failed to cancel request");
    }
  };

  const currentList = activeTab === "Incoming" ? incoming : outgoing;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Requests</h1>
        <p className="mt-1 text-muted-foreground">Manage your borrow and rent requests</p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Incoming", value: incoming.length, color: "text-primary" },
          { label: "Pending", value: incoming.filter(r => r.status === "pending").length, color: "text-yellow-600" },
          { label: "Accepted", value: incoming.filter(r => r.status === "accepted").length, color: "text-green-600" },
          { label: "Outgoing", value: outgoing.length, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? "..." : s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab} {tab === "Incoming" ? `(${incoming.length})` : `(${outgoing.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <PackageOpen className="h-16 w-16 stroke-1" />
          <p className="mt-4 text-lg font-medium">No {activeTab.toLowerCase()} requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              type={activeTab === "Incoming" ? "incoming" : "outgoing"}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;