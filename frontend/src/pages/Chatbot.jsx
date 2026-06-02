import { Bot, Send } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader.jsx";
import api from "../services/api.js";

export default function Chatbot() {
  const [language, setLanguage] = useState("English");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste. Ask about weeds, herbicide, dosage, weather timing, or image quality." }
  ]);

  const send = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const userMessage = { role: "user", text: message };
    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/chatbot/chat", { message, language });
      setMessages((current) => [...current, { role: "assistant", text: data.answer, provider: data.provider }]);
    } catch {
      toast.error("Chatbot request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="AI Chatbot Assistance" subtitle="Agriculture-focused assistant with English, Hindi, and Marathi support." />
      <div className="glass-panel rounded-lg">
        <div className="flex flex-col gap-3 border-b border-field-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-field-700 to-emerald-500 text-white shadow-soft"><Bot size={20} /></div>
            <div className="min-w-0">
              <p className="font-semibold">Shiwar Samvad Assistant</p>
              <p className="text-xs text-slate-500">Safety-aware crop and weed guidance</p>
            </div>
          </div>
          <select className="sm:max-w-44" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Chat language">
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
          </select>
        </div>
        <div className="h-[52vh] min-h-[360px] space-y-3 overflow-y-auto p-3 sm:h-[58vh] sm:p-4">
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[92%] break-words rounded-lg border px-3 py-3 text-sm leading-6 shadow-sm backdrop-blur sm:max-w-[82%] sm:px-4 ${item.role === "user" ? "border-field-600 bg-gradient-to-br from-field-700 to-field-600 text-white" : "border-white/70 bg-white/70 text-slate-800"}`}>
                {item.text}
                {/* {item.provider && <p className="mt-2 text-xs opacity-70">Provider: {item.provider}</p>} */}
              </div>
            </div>
          ))}
          {loading && <p className="text-sm font-medium text-field-700">Thinking...</p>}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-field-100 p-3 sm:gap-3 sm:p-4">
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a farming question..." />
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-field-700 to-emerald-500 text-white shadow-soft transition hover:-translate-y-0.5" title="Send" aria-label="Send message">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
