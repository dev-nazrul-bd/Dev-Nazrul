import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Bot, X, Send, Loader2, Sparkles, AlertCircle, RefreshCw, Terminal } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "আসসালামু আলাইকুম! I am Dev Nazrul AI Expert. How can I help you today? Please feel free to ask me about Nazrul's skills, pricing estimates, past IoT/Android telemetry projects, or general software questions!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const calculateLocalResponse = (query: string): string => {
    const text = query.toLowerCase();
    const isBengali = /[\u0980-\u09FF]/.test(text);

    // 1. Pricing / Cost Keywords
    if (
      text.includes("price") || 
      text.includes("pricing") || 
      text.includes("cost") || 
      text.includes("budget") || 
      text.includes("charge") || 
      text.includes("fee") || 
      text.includes("দাম") || 
      text.includes("খরচ") || 
      text.includes("বাজেট") || 
      text.includes("টাকা") || 
      text.includes("মূল্য") || 
      text.includes("কস্ট")
    ) {
      if (isBengali) {
        return "মোঃ নজরুল ইসলাম অত্যন্ত প্রতিযোগিতামূলক এবং বাজেট-বান্ধব সেবা দিয়ে থাকেন:\n\n" +
          "💼 **১. রিয়াক্ট/নেক্সট ওয়েব ডেভেলপমেন্ট (Web Apps)**: খরচ শুরু মাত্র **৳১২,০০০ BDT** থেকে।\n" +
          "📱 **২. নেটিভ অ্যান্ড্রয়েড আইওটি (Android & BLE IoT)**: খরচ শুরু মাত্র **৳১৬,০৫০ BDT** থেকে। (ব্লুটুথ BLE ও সেন্সর রিডিং সহ)\n" +
          "🔒 **৩. ব্যাকএন্ড এপিআই ও সিকিউরিটি অডিট**: খরচ শুরু মাত্র **৳৮,০০০ BDT** থেকে।\n\n" +
          "আপনি চাইলে এই ওয়েবসাইটের **Live Budget Calculator** ব্যবহার করে আপনার পছন্দমতো মডিউল যোগ-বিয়োগ করে ইনস্ট্যান্ট হিসাব দেখে নিতে পারেন। অথবা সরাসরি যোগাযোগ করতে ইমেইল করতে পারেন:\n" +
          "👉 [dev.nazrul.bd@gmail.com](mailto:dev.nazrul.bd@gmail.com)";
      } else {
        return "Md. Nazrul Islam offers highly competitive and transparent tier systems:\n\n" +
          "💼 **1. React / Next.js Web Portals**: Starting from **৳12,000 BDT**.\n" +
          "📱 **2. Kotlin Native Android Apps**: Starting from **৳16,050 BDT** (Includes BLE tracking & custom state managers).\n" +
          "🔒 **3. Back-end APIs & Rules Auditing**: Starting from **৳8,000 BDT**.\n\n" +
          "You can try the **Live Budget Calculator** directly on this site to sum up features of interest! Or send a direct email inquiry:\n" +
          "👉 [dev.nazrul.bd@gmail.com](mailto:dev.nazrul.bd@gmail.com)";
      }
    }

    // 2. Android / IoT / BLE / Sensors
    if (
      text.includes("android") || 
      text.includes("iot") || 
      text.includes("kotlin") || 
      text.includes("ble") || 
      text.includes("bluetooth") || 
      text.includes("sensor") || 
      text.includes("telemetry") || 
      text.includes("কৃষি") || 
      text.includes("ব্লুটুথ") || 
      text.includes("ডিভাইস") || 
      text.includes("আইওটি")
    ) {
      if (isBengali) {
        return "মোঃ নজরুল ইসলাম অ্যান্ড্রয়েড আইওটি (IoT) ও এগ্রো-টেলিমետ্রি প্রজেক্টে বিশেষভাবে দক্ষ:\n\n" +
          "📡 **Bluetooth Low Energy (BLE)**: ব্লুটুথ ডিভাইস স্ক্যানিং, পেয়ারিং এবং অ্যাড্রেস ফিল্টারিংয়ের চমৎকার অভিজ্ঞতা।\n" +
          "🌾 **IoT Telemetry**: মাটির আর্দ্রতা, পিএইচ মিটার এবং বৈরী তাপমাত্রা রিয়েল-টাইমে অ্যান্ড্রোয়েড অ্যাপে ট্র্যাকিং।\n" +
          "⚙️ **Native SDK & Compose**: চমৎকার স্পিড এবং অফলাইন লোকাল ডেটা সুরক্ষার জন্য কোটলিন ও জেটপ্যাক কম্পোজ ব্যবহার।\n\n" +
          "ওনার বেশ কিছু কাজের ভিডিও এবং সোর্স কোড রানিং কন্ডিশনে আপনি 'প্রজেক্ট গ্যালারি' ট্যাবে সরাসরি দেখে নিতে পারবেন!";
      } else {
        return "Md. Nazrul Islam is highly specialized in custom Android Native & IoT agricultural telemetry systems:\n\n" +
          "📡 **Bluetooth Low Energy (BLE)**: Implements fast polling and zero-noise hardware pairing flows on Android.\n" +
          "🌾 **IoT & Agro Sensors**: Integrates real-time values like humidity, soil moisture trackers, and temperature indicators.\n" +
          "⚙️ **Native Performance**: Utilizes Kotlin Native SDK & Jetpack Compose for low battery consumption.\n\n" +
          "Explore the dynamic screenshot galleries and live project video links here on the portfolio!";
      }
    }

    // 3. Contact / Hire / Phone / WhatsApp
    if (
      text.includes("contact") || 
      text.includes("hire") || 
      text.includes("whatsapp") || 
      text.includes("phone") || 
      text.includes("email") || 
      text.includes("address") || 
      text.includes("যোগাযোগ") || 
      text.includes("হোয়াটসঅ্যাপ") || 
      text.includes("নাম্বার") || 
      text.includes("ঠিকানা") || 
      text.includes("ইমেইল") || 
      text.includes("কন্টাক্ট")
    ) {
      if (isBengali) {
        return "মোঃ নজরুল ইসলামের সাথে সরাসরি নিচে দেওয়া ইমেইল ঠিকানায় যোগাযোগ করতে পারেন:\n\n" +
          "📧 **ইমেইল**: [dev.nazrul.bd@gmail.com](mailto:dev.nazrul.bd@gmail.com) (যোগাযোগের জন্য সবচেয়ে বেশি সাজেস্টেড ও হাইলাইটেড মাধ্যম)\n" +
          "💻 **GitHub**: [github.com/dev-nazrul-bd](https://github.com/dev-nazrul-bd)\n" +
          "📍 **বর্তমান অবস্থান**: বাংলাদেশ (রিমোটলি গ্লোবাল কাজ করেন)।\n\n" +
          "যেকোনো প্রজেক্ট আলোচনার জন্য নির্দ্বিধায় ইমেইল পাঠান বা এই সাইটের কন্টাক্ট ফর্ম পূরণ করুন!";
      } else {
        return "You can get in touch with Md. Nazrul Islam immediately:\n\n" +
          "📧 **Email**: [dev.nazrul.bd@gmail.com](mailto:dev.nazrul.bd@gmail.com) (Highly recommended highlighted primary contact)\n" +
          "💻 **GitHub profile**: [github.com/dev-nazrul-bd](https://github.com/dev-nazrul-bd)\n" +
          "📍 **Location**: Bangladesh (Available for remote contracts globally).";
      }
    }

    // 4. Skills / Tech / Stack
    if (
      text.includes("skill") || 
      text.includes("expert") || 
      text.includes("stack") || 
      text.includes("experience") || 
      text.includes("tech") || 
      text.includes("ভাষা") || 
      text.includes("ল্যাঙ্গুয়েজ") || 
      text.includes("দক্ষতা") || 
      text.includes("অভিজ্ঞতা") || 
      text.includes("টেকনোলজি")
    ) {
      if (isBengali) {
        return "মোঃ নজরুল ইসলামের কারিগরি দক্ষতা চমৎকার ও বিস্তৃত:\n\n" +
          "🚀 **ফ্রন্টএন্ড**: Next.js (App Router), React, Tailwind CSS (v4), TypeScript\n" +
          "⚙️ **ব্যাকএন্ড**: Node.js, Express, REST APIs\n" +
          "📱 **মোবাইল**: Kotlin Native, Jetpack Compose, BLE telemetry interfaces\n" +
          "💾 **ডাটাবেজ**: Cloud Firestore, Realtime Database (with custom secure zero-trust validation rules)\n\n" +
          "তিনি মোবাইল অ্যাপ ও রেসপন্সিভ ওয়েব পোর্টালের চমৎকার কম্বিনেশনে রিয়েল-টাইম ক্লায়েন্ট প্রজেক্ট হ্যান্ডেল করেন।";
      } else {
        return "Md. Nazrul Islam possesses a robust and clean production tech stack:\n\n" +
          "🚀 **Web Interfaces**: Next.js, React, Tailwind CSS, TypeScript, JavaScript\n" +
          "⚙️ **Server & Endpoints**: Node.js, Express\n" +
          "📱 **Mobile Native**: Kotlin SDK, Bluetooth Low Energy (BLE), Native Telemetry gateways\n" +
          "💾 **Databases**: Firestore, Custom security policies, indexes auditing.";
      }
    }

    // 5. Greeting / Intro
    if (
      text.includes("hi") || 
      text.includes("hello") || 
      text.includes("hey") || 
      text.includes("কেমন") || 
      text.includes("হ্যালো") || 
      text.includes("হাই") || 
      text.includes("সালাম") || 
      text.includes("আসসালামু")
    ) {
      if (isBengali) {
        return "আসসালামু আলাইকুম! মোঃ নজরুল ইসলামের এআই এসিস্ট্যান্টে আপনাকে স্বাগতম। আলহামদুলিল্লাহ আমি চমৎকার আছি!\n\n" +
          "আমি আপনাকে ওনার কারিগরি দক্ষতা, প্রজেক্ট বাজেট ট্র্যাকিং, কিংবা অ্যান্ড্রোয়েড এবং আইওটি প্রজেক্ট সম্পর্কে যেকোনো জিজ্ঞাসা সমাধান করতে সাহায্য করব। বলুন, আজ কীভাবে সাহায্য করতে পারি?";
      } else {
        return "Hello and welcome to Md. Nazrul's official AI assistant panel!\n\n" +
          "I can gladly explain Nazrul's tech stack, help you estimate costs for your custom app, clarify his BLE IoT projects, or facilitate direct contact. What's on your mind?";
      }
    }

    // 6. Generic Fallback
    if (isBengali) {
      return "আমি মোঃ নজরুল ইসলামের অফিশিয়াল পোর্টফোলিও পার্টনার। আপনার বার্তাটির জন্য অনেক ধন্যবাদ!\n\n" +
        "আপনার জিজ্ঞাসাটি ওনার জন্য অত্যন্ত মূল্যবান। সংক্ষেপে ওনার প্রধান সেবাগুলো নিচে দেখুন:\n\n" +
        "🛠️ **মূল স্পেশালিটি**: রেসপন্সিভ Next.js ওয়েব পোর্টাল ও Kotlin অ্যান্ড্রয়েড আইওটি (Agro/Soil sensors, BLE) পোর্টাল।\n" +
        "💳 **বাজেট**: কাস্টম ওয়েবসাইট ডিজাইন ১২,০০০ টাকা ও কোটলিন মোবাইল অ্যাপস ১৬,০৫০ টাকা থেকে শুরু।\n" +
        "📞 **সহজ চ্যাট**: আরো ক্লিয়ার আলোচনার জন্য ওনার সাথে সরাসরি ইমেইলে যোগাযোগ করতে পারেন: [dev.nazrul.bd@gmail.com](mailto:dev.nazrul.bd@gmail.com)";
    } else {
      return "I am Md. Nazrul's Portfolio Partner. Thank you for your message!\n\n" +
        "To quickly guide your exploration, here are high-quality highlights of Nazrul's services:\n\n" +
        "🛠️ **Fields of Practice**: Responsive fullstack Next.js client systems, Kotlin Native Android APKs, and Embedded BLE agricultural logging telemetry.\n" +
        "💳 **Pricing**: Dynamic websites starting at ৳12,000 BDT, mobile systems at ৳16,050 BDT.\n" +
        "📞 **Direct Support**: Message him on his highlighted email address directly to discuss your specs: [dev.nazrul.bd@gmail.com](mailto:dev.nazrul.bd@gmail.com)! He will respond shortly.";
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend.trim() };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);
    setErrorStatus(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send past 8 messages to keep contextual focus and avoid token overflow
        body: JSON.stringify({ messages: updatedMessages.slice(-8) }),
      });

      if (!response.ok) {
        throw new Error("HTTP_ERROR");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("HTML_RECEIVED_FALLBACK");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.text || "I was unable to formulate a response. Please try again." }]);
    } catch (err: any) {
      console.warn("[AIAssistant] Server chat handler hit SPA fallback, or API key not verified. Switching instantly to on-device smart matcher:", err);
      
      // Delay response slightly to simulate human-like reasoning/thought processing
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const localResult = calculateLocalResponse(textToSend.trim());
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: localResult },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (qn: string) => {
    handleSendMessage(qn);
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "আসসালামু আলাইকুম! I've refreshed our conversation. Ask me anything about Nazrul's experience, cost estimates, or stack capabilities!",
      },
    ]);
    setErrorStatus(null);
  };

  const quickPrompts = [
    { label: "প্রজেক্টের দাম কেমন?", text: "What is your pricing estimates for fullstack Next.js and Kotlin Android apps?" },
    { label: "Android / IoT experience", text: "Can you detail your Android SDK & Bluetooth Low Energy BLE integration experience?" },
    { label: "How to hire?", text: "How can I hire Dev Nazrul or contact him directly on WhatsApp?" },
  ];

  return (
    <div id="ai-assistant-wrapper" className="fixed bottom-12 sm:bottom-16 right-6 z-50">
      
      {/* Small Glowing Toggle Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-assistant-trigger-btn"
          className="relative group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto cursor-pointer border border-indigo-500/20"
        >
          {/* Ripple ambient effect */}
          <span className="absolute -inset-1 rounded-full bg-indigo-500/20 blur pointer-events-none group-hover:scale-110 transition duration-300"></span>
          <Bot className="w-5 h-5 animate-pulse text-indigo-100" />
          <span className="hidden sm:inline font-mono text-[11px] tracking-wider uppercase text-indigo-100">AI Advisor Expert</span>
          {/* Notification bubble */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border border-slate-950 rounded-full animate-bounce"></span>
        </button>
      )}

      {/* Main Chat Assistant Workspace interface */}
      {isOpen && (
        <div
          id="ai-assistant-panel"
          className="w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 border-indigo-500/40"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Header Panel */}
          <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-850 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500 flex items-center justify-center relative">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950"></span>
              </div>
              <div>
                <h4 className="font-sans font-extrabold text-xs text-slate-100 tracking-widest uppercase flex items-center gap-1">
                  DEV NAZRUL AI <span className="text-[9px] text-indigo-400 font-mono font-normal">v3.5</span>
                </h4>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight block">Live Studio Grounding Active</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset History */}
              <button 
                onClick={handleReset}
                className="text-slate-450 hover:text-slate-100 p-1 rounded-md hover:bg-slate-900 transition-all cursor-pointer"
                title="Reset Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-450 hover:text-slate-100 p-1 rounded-md hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages History Scroller Box */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-950/30 font-sans text-xs scrollbar-thin">
            {messages.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"} items-start gap-2 animate-in fade-in duration-300`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-450" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 shadow-sm text-left ${
                    isAssistant 
                      ? "bg-slate-900/90 border border-slate-800 text-slate-200" 
                      : "bg-indigo-650 text-white font-medium"
                  } whitespace-pre-wrap leading-relaxed`}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {/* AI Reasoning state Loader */}
            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                </div>
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl px-3.5 py-3 text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span className="font-mono text-[10px] uppercase">Reasoning stream...</span>
                </div>
              </div>
            )}

            {/* Error presentation alert */}
            {errorStatus && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-450 text-[11px] leading-relaxed flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-mono font-bold uppercase text-[10px]">Transmission Issue</p>
                  <p className="mt-0.5 text-slate-350">{errorStatus}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-reply Starter Bubbles (Only if message count is low) */}
          {messages.length < 5 && (
            <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900 flex flex-wrap gap-1.5 z-10 text-left">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(qp.text)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850/80 text-[10px] text-indigo-350 hover:text-indigo-300 rounded-lg border border-slate-800 cursor-pointer text-left transition-all"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {/* Form write input container */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-slate-950 border-t border-slate-900 z-10 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Dev Nazrul AI..."
              maxLength={400}
              className="flex-grow bg-slate-900 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl p-2.5 transition-all text-xs flex-shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
