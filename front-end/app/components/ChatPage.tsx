"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import ChatWindow from "./ChatWindow";
import AnnouncementModal from "./AnnouncementModal";
import Notification, { NotificationType } from "./Notification";
import { useChatHistory } from "../../hooks/useChatHistory";
import { useWebSocket, WsIncoming } from "../../hooks/useWebSocket";
import type { Message } from "../../types/index";

// Status shown below the input while the bot is working
type BotStatus = "idle" | "searching" | "generating";

type Language = "ru" | "kk" | "en";

const translations = {
  ru: {
    sidebarTitle: "История",
    newChat: "Новый чат",
    universityAssistant: "Университетский ассистент",
    clearAll: "Очистить всё",
    student: "Студент",
    botStatusSearching: "Ищем в базе знаний...",
    botStatusGenerating: "Печатает...",
    inputPlaceholder: "Задайте вопрос Zere AI...",
    sendButton: "Отправить",
    responseReceived: "Ответ получен",
    inputWarning: "Может допускать ошибки. Рекомендуем проверять важную информацию.",
    connectionStatusConnected: "Подключен",
    connectionStatusConnecting: "Подключение...",
    connectionStatusDisconnected: "Отключен",
    today: "Сегодня",
    yesterday: "Вчера",
    previous7Days: "За 7 дней",
    older: "Старые",
    announcementTitle: "Добро пожаловать в ",
    announcementBody: "Я готов ответить на ваши вопросы по университету.",
    announcementButton: "Начать",
    menu: "Меню",
    about: "О проекте"
  },
  kk: {
    sidebarTitle: "Тарих",
    newChat: "Жаңа чат",
    universityAssistant: "Университеттік көмекші",
    clearAll: "Барлығын өшіру",
    student: "Студент",
    botStatusSearching: "Дерекқордан іздеуде...",
    botStatusGenerating: "Теруде...",
    inputPlaceholder: "Zere AI-ға сұрақ қойыңыз...",
    sendButton: "Жіберу",
    responseReceived: "Жауап алынды",
    inputWarning: "Мүмкін қателіктер болуы мүмкін. Маңызды ақпаратты тексеруді ұсынамыз.",
    connectionStatusConnected: "Қосылған",
    connectionStatusConnecting: "Қосылуда...",
    connectionStatusDisconnected: "Қосылмаған",
    today: "Бүгін",
    yesterday: "Кеше",
    previous7Days: "7 күн ішінде",
    older: "Ескі",
    announcementTitle: "қош келдіңіз ",
    announcementBody: "Университет туралы сұрақтарыңызға жауап беруге дайынмын.",
    announcementButton: "Бастау",
    menu: "Мәзір",
    about: "Біз туралы"
  },
  en: {
    sidebarTitle: "History",
    newChat: "New Chat",
    universityAssistant: "University Assistant",
    clearAll: "Clear All",
    student: "Student",
    botStatusSearching: "Searching knowledge base...",
    botStatusGenerating: "Typing...",
    inputPlaceholder: "Ask Zere AI a question...",
    sendButton: "Send",
    responseReceived: "Response received",
    inputWarning: "May contain errors. We recommend verifying important information.",
    connectionStatusConnected: "Connected",
    connectionStatusConnecting: "Connecting...",
    connectionStatusDisconnected: "Disconnected",
    today: "Today",
    yesterday: "Yesterday",
    previous7Days: "Last 7 days",
    older: "Older",
    announcementTitle: "Welcome to ",
    announcementBody: "I am ready to answer your questions about the university.",
    announcementButton: "Start",
    menu: "Menu",
    about: "About"
  }
};

export default function ChatPage() {
  const {
    groupedChats,
    mounted,
    currentChatId,
    saveMessage,
    loadChat,
    deleteChat,
    newChat,
    clearAll,
  } = useChatHistory();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [botStatus, setBotStatus] = useState<BotStatus>("idle");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("ru");
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // We stream tokens into a ref so we can append without stale closures,
  // then flush into messages state when done.
  const streamingIdRef = useRef<string | null>(null);

  // Show announcement on first visit
  useEffect(() => {
    if (!localStorage.getItem("zere-announcement-shown")) {
      setTimeout(() => setModalOpen(true), 1000);
      localStorage.setItem("zere-announcement-shown", "true");
    }
    
    // Load language preference
    const savedLang = localStorage.getItem("zere-language") as Language;
    if (savedLang && ["ru", "kk", "en"].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("zere-language", lang);
  };

  const t = translations[language];

  const notify = (message: string, type: NotificationType = "success") =>
    setNotification({ message, type });

  // ── WebSocket event handler ─────────────────────────────────────────────────

  const handleWsMessage = useCallback(
    (msg: WsIncoming) => {
      switch (msg.type) {
        case "searching":
          setBotStatus("searching");
          break;

        case "search_done":
          setBotStatus("generating");
          // Create a placeholder bot message that will receive tokens
          {
            const id = String(Date.now());
            streamingIdRef.current = id;
            setMessages((prev) => [
              ...prev,
              { id, role: "bot", text: "", time: Date.now() },
            ]);
          }
          break;

        case "token":
          // Append token to the streaming message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingIdRef.current
                ? { ...m, text: m.text + msg.token }
                : m
            )
          );
          break;

        case "done":
          setBotStatus("idle");
          // Persist the completed bot message in local history
          setMessages((prev) => {
            const botMsg = prev.find((m) => m.id === streamingIdRef.current);
            if (botMsg?.text) saveMessage("bot", botMsg.text);
            streamingIdRef.current = null;
            return prev;
          });
          notify(t.responseReceived);
          break;

        case "error":
          setBotStatus("idle");
          streamingIdRef.current = null;
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              role: "bot",
              text: `⚠️ ${msg.message}`,
              time: Date.now(),
            },
          ]);
          notify(msg.message, "error");
          break;

        default:
          break;
      }
    },
    [saveMessage]
  );

  // ── WebSocket connection ────────────────────────────────────────────────────

  const WS_URL =
    (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080") + "/ws";

  const { status: wsStatus, sendQuestion } = useWebSocket({
    url: WS_URL,
    sessionId: currentChatId,
    onMessage: handleWsMessage,
  });

  // ── Send message ────────────────────────────────────────────────────────────

  const handleSend = useCallback(
    async (text: string) => {
      if (botStatus !== "idle" || wsStatus !== "connected") return;

      const userMsg: Message = {
        id: String(Date.now()),
        role: "user",
        text,
        time: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      saveMessage("user", text);

      sendQuestion(text);
    },
    [botStatus, wsStatus, saveMessage, sendQuestion]
  );

  // ── Sidebar actions ─────────────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    newChat();
    setMessages([]);
    notify(t.newChat);
  }, [newChat, t]);

  const handleLoadChat = useCallback(
    (id: string) => {
      const loaded = loadChat(id);
      setMessages(loaded);
      notify("Чат загружен");
    },
    [loadChat]
  );

  const handleDeleteChat = useCallback(
    (id: string) => {
      deleteChat(id);
      if (id === currentChatId) setMessages([]);
      notify("Чат удалён");
    },
    [deleteChat, currentChatId]
  );

  const handleClearAll = useCallback(() => {
    clearAll();
    setMessages([]);
    notify(t.clearAll);
  }, [clearAll, t]);

  const handleExport = useCallback(() => {
    const allHistory = JSON.parse(localStorage.getItem("chatHistory") || "{}");
    const chat = allHistory[currentChatId];
    if (!chat) { notify("Нет данных для экспорта", "error"); return; }

    let text = `Чат: ${chat.title}\nДата: ${new Date(chat.createdAt).toLocaleString("ru-RU")}\n${"─".repeat(50)}\n\n`;
    chat.messages.forEach((m: Message) => {
      const sender = m.role === "user" ? "Вы" : "Zere AI";
      const time = new Date(m.time).toLocaleTimeString("ru-RU");
      text += `[${time}] ${sender}:\n${m.text}\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `zere-ai-${chat.title.substring(0, 20)}.txt`;
    link.click();
    notify("Чат экспортирован");
  }, [currentChatId]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const isLoading = botStatus !== "idle";
  const emptyGroups = { today: [], yesterday: [], older: [] };
  const safeGroups = mounted ? groupedChats : emptyGroups;

  return (
    <>
      <div className="background-animation" id="backgroundAnimation" />
      <div className="progress-bar" style={{ width: isLoading ? "70%" : "0" }} />

      <Notification
        message={notification?.message ?? null}
        type={notification?.type}
        onDismiss={() => setNotification(null)}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        groupedChats={safeGroups}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
      />

      <AnnouncementModal isOpen={modalOpen} onClose={() => setModalOpen(false)} language={language} />

      <div className="container">
        <Sidebar
          groupedChats={safeGroups}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          onDeleteChat={handleDeleteChat}
          onClearAll={handleClearAll}
          translations={t}
          language={language}
          onLanguageChange={changeLanguage}
        />
        <div className="header">
          <div className="logo h-7 flex justify-center items-center">
          </div>
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <div className="header-actions">
            <button className="header-btn" onClick={() => setModalOpen(true)}>
              {t.about}
            </button>
          </div>
        </div>

        <div className="chat-container">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            status={botStatus}
            onSend={handleSend}
            onExport={handleExport}
            wsStatus={wsStatus}
            translations={t}
          />
        </div>
      </div>
    </>
  );
}
