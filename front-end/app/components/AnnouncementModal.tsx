"use client";

import { useEffect } from "react";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

const translations = {
  ru: {
    welcome: "Добро пожаловать в Zere AI!",
    subtitle: "Ваш умный университетский ассистент",
    aboutTitle: "🎓 О проекте",
    aboutText: "Zere AI — это интеллектуальный помощник, созданный специально для студентов. Наша цель — облегчить вашу университетскую жизнь, предоставляя быстрые и точные ответы на любые вопросы.",
    featuresTitle: "✨ Возможности",
    feature1Title: "Помощь с учёбой:",
    feature1Text: "Объяснения сложных концепций, помощь с домашними заданиями",
    feature2Title: "Организация:",
    feature2Text: "Планирование расписания, напоминания о дедлайнах",
    feature3Title: "24/7 доступность:",
    feature3Text: "Помощь в любое время дня и ночи",
    startTitle: "🚀 Как начать?",
    startText: "Просто задайте любой вопрос в поле ввода ниже. Zere AI поможет вам с учебными материалами, объяснит сложные темы, поможет с исследованиями и многим другим!",
    tag1: "Естественный диалог",
    tag2: "Умные ответы",
    tag3: "База знаний",
    tag4: "Быстрая работа",
    startButton: "Начать работу"
  },
  kk: {
    welcome: "Zere AI-ға қош келдіңіз!",
    subtitle: "Сіздің ақылды университет көмекшіңіз",
    aboutTitle: "🎓 Жоба туралы",
    aboutText: "Zere AI — студенттер үшін арнайы жасалған интеллектуалды көмекші. Біздің мақсат — кез келген сұраққа жылдам және дәл жауап бере отырып, университет өмірін жеңілдету.",
    featuresTitle: "✨ Мүмкіндіктер",
    feature1Title: "Оқуға көмек:",
    feature1Text: "Күрделі тұжырымдамаларды түсіндіру, үй тапсырмасына көмек",
    feature2Title: "Ұйымдастыру:",
    feature2Text: "Кестені жоспарлау, мерзімдер туралы еске салу",
    feature3Title: "24/7 қолжетімділік:",
    feature3Text: "Күн мен түннің кез келген уақытында көмек",
    startTitle: "🚀 Қалай бастау керек?",
    startText: "Төмендегі енгізу өрісіне кез келген сұрақты қойыңыз. Zere AI оқу материалдарымен көмектеседі, күрделі тақырыптарды түсіндіреді, зерттеуге көмектеседі және т.б.!",
    tag1: "Табиғи диалог",
    tag2: "Ақылды жауаптар",
    tag3: "Деректер базасы",
    tag4: "Жылдам жұмыс",
    startButton: "Жұмысты бастау"
  },
  en: {
    welcome: "Welcome to Zere AI!",
    subtitle: "Your smart university assistant",
    aboutTitle: "🎓 About the project",
    aboutText: "Zere AI is an intelligent assistant created specifically for students. Our goal is to make your university life easier by providing quick and accurate answers to any questions.",
    featuresTitle: "✨ Features",
    feature1Title: "Study help:",
    feature1Text: "Explanation of complex concepts, help with homework",
    feature2Title: "Organization:",
    feature2Text: "Schedule planning, deadline reminders",
    feature3Title: "24/7 availability:",
    feature3Text: "Help at any time of the day or night",
    startTitle: "🚀 How to start?",
    startText: "Just ask any question in the input field below. Zere AI will help you with study materials, explain complex topics, help with research, and much more!",
    tag1: "Natural dialogue",
    tag2: "Smart answers",
    tag3: "Knowledge base",
    tag4: "Fast work",
    startButton: "Get started"
  }
};

export default function AnnouncementModal({ isOpen, onClose, language = "ru" }: AnnouncementModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const t = translations[language as keyof typeof translations] || translations.ru;

  return (
    <div className="announcement-modal show">
      <div className="announcement-overlay" onClick={onClose} />
      <div className="announcement-content">
        <button className="announcement-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="announcement-banner">
          <img src="/assets/banner.webp" alt="Zere AI Banner" className="announcement-banner-img" />
        </div>

        <div className="announcement-body">
          <div className="announcement-header">
            <div className="announcement-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="announcement-title">{t.welcome}</h2>
            <p className="announcement-subtitle">{t.subtitle}</p>
          </div>

          <div className="announcement-description">
            <h3>{t.aboutTitle}</h3>
            <p>
              {t.aboutText}
            </p>

            <h3>{t.featuresTitle}</h3>
            <ul>
              <li><strong>{t.feature1Title}</strong> {t.feature1Text}</li>
              <li><strong>{t.feature2Title}</strong> {t.feature2Text}</li>
              <li><strong>{t.feature3Title}</strong> {t.feature3Text}</li>
            </ul>

            <h3>{t.startTitle}</h3>
            <p>
              {t.startText}
            </p>

            <div className="announcement-features">
              {[
                { icon: "💬", text: t.tag1 },
                { icon: "🧠", text: t.tag2 },
                { icon: "📚", text: t.tag3 },
                { icon: "⚡", text: t.tag4 },
              ].map((f) => (
                <div key={f.text} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-text">{f.text}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="announcement-start-btn" onClick={onClose}>
            {t.startButton}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}