"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";
import { format } from "date-fns";
import { MessageSquare, Send, Hash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

const channels = ["general", "dev", "random"];
const channelLabels: Record<string, string> = { general: "全体", dev: "開発", random: "雑談" };

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channel, setChannel] = useState("general");
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const profile = store.getProfile();

  useEffect(() => {
    setMessages(store.getChatMessages(channel));
  }, [channel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const mentionRegex = /@(\S+)/g;
    const mentions: string[] = [];
    let m;
    while ((m = mentionRegex.exec(text)) !== null) mentions.push(m[1]);

    const msg: ChatMessage = {
      id: uuidv4(),
      user_id: profile.id,
      channel,
      content: text.trim(),
      mentions: [],
      created_at: new Date().toISOString(),
    };
    store.addChatMessage(msg);
    logActivity("chat_send", `#${channel}: ${text.trim().slice(0, 50)}`);
    setText("");
    setMessages(store.getChatMessages(channel));
  };

  return (
    <>
      <Header title="チームチャット" subtitle="リアルタイムコミュニケーション" />
      <div className="flex h-[calc(100vh-5rem)]">
        <div className="w-48 shrink-0 border-r border-card-border bg-card-bg p-3">
          <p className="mb-2 px-2 text-xs font-semibold text-muted uppercase">チャンネル</p>
          {channels.map((ch) => (
            <button key={ch} onClick={() => setChannel(ch)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${channel === ch ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground hover:bg-background"}`}>
              <Hash size={14} />
              {channelLabels[ch]}
            </button>
          ))}
          <p className="mt-4 px-2 text-xs text-muted">Supabase Realtime 連携後、リアルタイム同期されます</p>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare size={48} className="text-muted mb-4" />
                <p className="text-muted text-sm">まだメッセージがありません</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{profile.name}</span>
                      <span className="text-xs text-muted">{format(new Date(msg.created_at), "HH:mm")}</span>
                    </div>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-card-border p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`#${channelLabels[channel]} にメッセージを送信...`}
                className="flex-1 rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              <button type="submit" disabled={!text.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
