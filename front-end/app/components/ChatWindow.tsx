"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import type { Message } from "@/types";
import type { WsStatus } from "@/hooks/useWebSocket";
import ReactMarkdown from 'react-markdown';

type BotStatus = "idle" | "searching" | "generating";

interface ChatWindowProps {
  messages: Message[];
  onSend: (text: string) => Promise<void>;
  isLoading: boolean;
  botStatus?: BotStatus;
  status?: BotStatus;
  wsStatus: WsStatus;
  onExport?: () => void;
  translations?: any;
}

// ── Status label shown while bot is working ───────────────────────────────────

function StatusBubble({ botStatus, translations: t }: { botStatus: BotStatus, translations?: any }) {
  if (botStatus === "idle") return null;

  const label =
    botStatus === "searching"
      ? (t?.botStatusSearching || "Ищу в базе знаний...")
      : (t?.botStatusGenerating || "Генерирую ответ...");

  return (
    <div className="message bot-message">
      <div className="message-content">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Streaming message — renders text with a blinking cursor ──────────────────

function StreamingMessage({ text }: { text: string }) {
  return (
    <div className="message bot-message">
      <div className="message-content">
        <ReactMarkdown>{text}</ReactMarkdown>
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "currentColor",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            animation: "blink 1s step-end infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatWindow({
  messages,
  onSend,
  isLoading,
  botStatus,
  status,
  wsStatus,
  onExport,
  translations: t = {
    botStatusSearching: "Ищу в базе знаний...",
    botStatusGenerating: "Генерирую ответ...",
    inputPlaceholder: "Задайте вопрос...",
    sendButton: "Отправить"
  }
}: ChatWindowProps) {
  const currentBotStatus = botStatus || status || "idle";
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showStartScreen = messages.length === 0 && !isLoading;

  // The last message is a streaming one if the bot is generating
  const lastMsg = messages[messages.length - 1];
  const isStreamingMsg = currentBotStatus === "generating" && lastMsg?.role === "bot";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || wsStatus !== "connected") return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onSend(text);
  }, [input, isLoading, wsStatus, onSend]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !!input.trim() && !isLoading && wsStatus === "connected";

  return (
    <>
      {/* Blink cursor animation */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div className="messages" id="messages">
        {showStartScreen && (
          <div className="start-screen">
            <img
              src="/assets/start-intro2.webp"
              loading="lazy"
              alt="Zere AI"
              className="start-image"
            />
            <h1 className="start-text">
              {t.announcementTitle || "Привет! Я, "}<span className="title-intro">{"Zere AI"}</span>
            </h1>
            <p className="start-text-sub">
              {t.announcementBody}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          // Render the last bot message with a streaming cursor while generating
          if (isLast && msg.role === "bot" && isStreamingMsg) {
            return <StreamingMessage key={msg.id} text={msg.text} />;
          }
          return (
            <div key={msg.id} className={`message ${msg.role}-message`}>
              <div className="message-content">
                {msg.role === "bot" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}

        {/* Searching / waiting indicator (before streaming starts) */}
        {currentBotStatus === "searching" && <StatusBubble botStatus={currentBotStatus} translations={t} />}

        <div ref={bottomRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            id="question"
            placeholder={
              wsStatus !== "connected"
                ? (t.connectionStatusConnecting || "Подключение к серверу...")
                : (t.inputPlaceholder || "Задайте вопрос...")
            }
            autoComplete="off"
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            disabled={wsStatus !== "connected"}
          />
          <button id="askBtn" onClick={handleSend} disabled={!canSend} title={t.sendButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="input-hint">
          {t.inputWarning}
        </div>
      </div>
    </>
  );
}
