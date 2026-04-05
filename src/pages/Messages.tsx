import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Paperclip, Send, MessageSquare, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/messages/conversations");
        setConversations(res.data.conversations);
      } catch {
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConv) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedConv.userId}`);
        setMessages(res.data.messages);
        // Mark as read — update unread count in conversations
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === selectedConv.userId ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch {
        toast.error("Failed to load messages");
      }
    };
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedConv) return;
    setSending(true);
    try {
      const res = await api.post("/messages", {
        receiverId: selectedConv.userId,
        text: newMsg.trim(),
      });
      setMessages([...messages, res.data.message]);
      setNewMsg("");
      // Update last message in conversations
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === selectedConv.userId
            ? { ...c, lastMessage: newMsg.trim(), lastMessageTime: new Date() }
            : c
        )
      );
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const showChat = !!selectedConv;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full flex-shrink-0 border-r md:w-80 ${showChat ? "hidden md:flex" : "flex"} flex-col`}>
        <div className="border-b p-4">
          <h2 className="font-heading text-lg font-bold">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-9"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : filteredConversations.map((c) => (
            <button key={c.userId} onClick={() => setSelectedConv(c)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                selectedConv?.userId === c.userId ? "bg-primary/10" : ""
              }`}>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                  {getInitials(c.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(c.lastMessageTime)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
              </div>
              {c.unreadCount > 0 && (
                <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">
                  {c.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {showChat && selectedConv ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <button className="md:hidden" onClick={() => setSelectedConv(null)}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {getInitials(selectedConv.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{selectedConv.name}</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>

          {selectedConv.listingTitle && (
            <div className="mx-4 mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm">
              📦 <span className="font-medium">Re: {selectedConv.listingTitle}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {messages.map((m: any) => {
                const isMe = m.sender._id === user?._id || m.sender === user?._id;
                return (
                  <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted"
                    }`}>
                      <p>{m.text}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input placeholder="Type a message..." value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyDown} className="flex-1" />
              <Button size="icon" className="flex-shrink-0"
                onClick={handleSend} disabled={sending || !newMsg.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center text-muted-foreground md:flex">
          <MessageSquare className="h-16 w-16 stroke-1" />
          <p className="mt-4 text-lg font-medium">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default Messages;