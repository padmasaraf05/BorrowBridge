import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Paperclip, Send, MessageSquare, ArrowLeft } from "lucide-react";

const conversations = [
  { id: 1, name: "Rahul Sharma", initials: "RS", lastMsg: "Sure, you can pick it up tomorrow after 4 PM!", time: "2h ago", unread: 2 },
  { id: 2, name: "Priya Patel", initials: "PP", lastMsg: "Is the calculator still available?", time: "5h ago", unread: 0 },
  { id: 3, name: "Amit Kumar", initials: "AK", lastMsg: "Thanks for lending the Arduino kit!", time: "1d ago", unread: 1 },
  { id: 4, name: "Sneha Desai", initials: "SD", lastMsg: "I'll return the textbook by Friday.", time: "2d ago", unread: 0 },
  { id: 5, name: "Vikram Joshi", initials: "VJ", lastMsg: "Can you extend the rental by 2 days?", time: "3d ago", unread: 0 },
];

const chatMessages = [
  { id: 1, sender: "them", text: "Hey! I saw your listing for Engineering Maths Vol. 2. Is it still available?", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Hi! Yes, it's available. When do you need it?", time: "10:32 AM" },
  { id: 3, sender: "them", text: "I have exams starting next week, so ideally from Monday to Wednesday.", time: "10:33 AM" },
  { id: 4, sender: "me", text: "That works! It'll be ₹60/day, so ₹180 for 3 days.", time: "10:35 AM" },
  { id: 5, sender: "them", text: "Perfect, that's within my budget. Where can I pick it up?", time: "11:00 AM" },
  { id: 6, sender: "me", text: "I'm in Hostel B, Room 214. You can come anytime after 4 PM.", time: "11:02 AM" },
  { id: 7, sender: "them", text: "Great! I'll come by tomorrow around 5 PM then.", time: "11:05 AM" },
  { id: 8, sender: "me", text: "Sure, you can pick it up tomorrow after 4 PM!", time: "11:06 AM" },
];

const Messages = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");

  const selected = conversations.find((c) => c.id === selectedId);
  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const showChat = selectedId !== null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full flex-shrink-0 border-r md:w-80 ${showChat ? "hidden md:flex" : "flex"} flex-col`}>
        <div className="border-b p-4">
          <h2 className="font-heading text-lg font-bold">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selectedId === c.id ? "bg-primary/10" : ""}`}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">{c.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">{c.unread}</Badge>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {showChat && selected ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <button className="md:hidden" onClick={() => setSelectedId(null)}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{selected.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{selected.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" /> Active now
              </p>
            </div>
          </div>

          <div className="mx-4 mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm">
            📦 <span className="font-medium">Re: Engineering Maths Vol. 2</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-4 text-center text-xs text-muted-foreground">Today</p>
            <div className="space-y-3">
              {chatMessages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "me" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted"}`}>
                    <p>{m.text}</p>
                    <p className={`mt-1 text-[10px] ${m.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input placeholder="Type a message..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} className="flex-1" />
              <Button size="icon" className="flex-shrink-0">
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
