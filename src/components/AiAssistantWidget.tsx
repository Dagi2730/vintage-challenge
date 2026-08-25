'use client';

import { useState } from 'react';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

const FAQ_ITEMS = [
  {
    question: '🛡️ How does Fayda ID verification work?',
    answer:
      'Fayda National ID verification verifies seller identities using Ethiopia’s Fayda digital ID system. You submit your 16-digit FAN number, verify via SMS OTP, and upload your ID document for admin approval. Verified sellers receive a green 🛡️ Fayda Verified badge on all their listings!',
  },
  {
    question: '🛒 How do I buy an item safely?',
    answer:
      'To buy an item: 1) Browse or search for items. 2) Click "Buy Item" or contact the seller directly via Telegram / Phone. 3) Meet in a safe public location in your neighborhood to inspect the item. 4) Confirm purchase and leave a star review!',
  },
  {
    question: '📦 How do I list an item for sale?',
    answer:
      'Click the "+ Sell" button in the navigation header, select 3 to 5 photos of your item, enter title, description, category, and price in ETB, choose your city and subcity, and click "Publish Listing". It goes live instantly!',
  },
  {
    question: '⚠️ How do I report a suspicious listing?',
    answer:
      'Click the "🚩 Report Listing" button on any item page, select a reason (e.g. counterfeit, misleading price, suspicious behavior), and submit. Our Trust & Safety team reviews reports promptly.',
  },
  {
    question: '🔐 Is my personal information private?',
    answer:
      'Yes! Your contact details are only visible on your active listings. National ID verification documents are encrypted and accessible strictly by authorized administrators.',
  },
];

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: ' 👋 Welcome to E-merkato AI Support! How can I assist you today? Select a topic below or type your question.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');

  function handleFaqClick(faq: { question: string; answer: string }) {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: faq.question },
      { sender: 'ai', text: faq.answer },
    ]);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const matchedFaq = FAQ_ITEMS.find((f) =>
      userText.toLowerCase().includes(f.question.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
      f.answer.toLowerCase().includes(userText.toLowerCase())
    );

    let responseText =
      'Thank you for reaching out! For instant help, you can use our Fayda ID verification in your Account Dashboard, report items on listing pages, or click any FAQ button above. Our team is always here to keep E-merkato safe!';

    if (matchedFaq) {
      responseText = matchedFaq.answer;
    } else if (userText.toLowerCase().includes('fayda') || userText.toLowerCase().includes('verify')) {
      responseText = FAQ_ITEMS[0].answer;
    } else if (userText.toLowerCase().includes('buy') || userText.toLowerCase().includes('pay')) {
      responseText = FAQ_ITEMS[1].answer;
    } else if (userText.toLowerCase().includes('sell') || userText.toLowerCase().includes('post')) {
      responseText = FAQ_ITEMS[2].answer;
    } else if (userText.toLowerCase().includes('scam') || userText.toLowerCase().includes('report')) {
      responseText = FAQ_ITEMS[3].answer;
    }

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText },
      { sender: 'ai', text: responseText },
    ]);
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 flex items-center gap-2 text-xs tracking-wide"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>🤖 AI Assistant & FAQ</span>
      </button>

      {/* Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">E-merkato AI Support</h3>
                  <span className="text-[10px] text-blue-200 font-medium">Instant FAQ & Marketplace Assistant</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-xl font-bold p-1 leading-none"
              >
                ×
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((msg, index) => (
                <div
                  key={`msg-${index}`}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Quick FAQ Buttons */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Frequently Asked Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FAQ_ITEMS.map((faq, index) => (
                    <button
                      key={`faq-${index}`}
                      onClick={() => handleFaqClick(faq)}
                      className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-1.5 text-[11px] font-medium transition text-left shadow-2xs"
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask AI Assistant a question..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
