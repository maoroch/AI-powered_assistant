"use client";

import type { Chat } from "@/types";

interface SidebarProps {
  groupedChats: {
    today: Chat[];
    yesterday: Chat[];
    older: Chat[];
  };
  currentChatId: string;
  onNewChat: () => void;
  onLoadChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClearAll: () => void;
  onExport?: () => void;
  translations?: any;
  language?: string;
  onLanguageChange?: (lang: "ru" | "kk" | "en") => void;
}

function ChatGroup({
  title,
  chats,
  currentChatId,
  onLoad,
  onDelete,
}: {
  title: string;
  chats: Chat[];
  currentChatId: string;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!chats.length) return null;
  return (
    <div className="history-section">
      <div className="history-title">{title}</div>
      {chats.map((chat) => {
        const time = new Date(chat.updatedAt).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div
            key={chat.id}
            className={`history-item ${chat.id === currentChatId ? "active" : ""}`}
            onClick={() => onLoad(chat.id)}
          >
            <span>{chat.title}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span className="history-item-time">{time}</span>
              <button
                className="delete-history-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Sidebar({
  groupedChats,
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onClearAll,
  onExport,
  language = "ru",
  onLanguageChange,
  translations: t = {
    sidebarTitle: "История",
    newChat: "Новый чат",
    clearAll: "Очистить всё",
    today: "Сегодня",
    yesterday: "Вчера",
    older: "Ранее"
  }
}: SidebarProps) {
  const hasChats =
    groupedChats.today.length + groupedChats.yesterday.length + groupedChats.older.length > 0;

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="sidebar-title">Zere AI</div>
          <div style={{ color: "#666", fontSize: 14 }}>{t.universityAssistant}</div>
        </div>
        
        {onLanguageChange && (
          <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
            <button 
              onClick={() => onLanguageChange("ru")}
              style={{ padding: '2px', border: 'none', background: 'none', cursor: 'pointer', color: language === 'ru' ? 'var(--input-bg)' : '#666', fontWeight: language === 'ru' ? 'bold' : 'normal' }}
            >
              RU
            </button>
            <button 
              onClick={() => onLanguageChange("kk")}
              style={{ padding: '2px', border: 'none', background: 'none', cursor: 'pointer', color: language === 'kk' ? 'var(--input-bg)' : '#666', fontWeight: language === 'kk' ? 'bold' : 'normal' }}
            >
              KK
            </button>
            <button 
              onClick={() => onLanguageChange("en")}
              style={{ padding: '2px', border: 'none', background: 'none', cursor: 'pointer', color: language === 'en' ? 'var(--input-bg)' : '#666', fontWeight: language === 'en' ? 'bold' : 'normal' }}
            >
              EN
            </button>
          </div>
        )}
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        + {t.newChat}
      </button>

      <div className="chat-history">
        {!hasChats ? (
          <div className="empty-history">Нет сохранённых чатов</div>
        ) : (
          <>
            <ChatGroup
              title={t.today}
              chats={groupedChats.today}
              currentChatId={currentChatId}
              onLoad={onLoadChat}
              onDelete={onDeleteChat}
            />
            <ChatGroup
              title={t.yesterday}
              chats={groupedChats.yesterday}
              currentChatId={currentChatId}
              onLoad={onLoadChat}
              onDelete={onDeleteChat}
            />
            <ChatGroup
              title={t.older}
              chats={groupedChats.older}
              currentChatId={currentChatId}
              onLoad={onLoadChat}
              onDelete={onDeleteChat}
            />
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">U</div>
          <div className="user-name">{t.student}</div>
        </div>
      </div>
    </div>
  );
}
