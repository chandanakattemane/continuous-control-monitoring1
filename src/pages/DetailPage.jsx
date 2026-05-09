import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const control = location.state;

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  if (!control) {
    navigate("/");
    return null;
  }

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-700 border border-green-300",
      INACTIVE: "bg-gray-100 text-gray-600 border border-gray-300",
      PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      OVERDUE: "bg-red-100 text-red-700 border border-red-300",
    };
    return colors[status] || "bg-blue-100 text-blue-700";
  };

  const getRiskBadge = (priority) => {
    const colors = {
      LOW: "bg-green-100 text-green-700 border border-green-300",
      MEDIUM: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      HIGH: "bg-orange-100 text-orange-700 border border-orange-300",
      CRITICAL: "bg-red-100 text-red-700 border border-red-300",
    };
    return colors[priority] || "bg-gray-100 text-gray-600";
  };

  const getScoreColor = (riskScore) => {
    if (riskScore >= 80) return "bg-green-500";
    if (riskScore >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleAskAI = () => {
    setAiLoading(true);
    setAiResponse(null);
    setAiError(false);

    setTimeout(() => {
      setAiLoading(false);
      setAiResponse({
        summary: `The control "${control.title}" is currently ${control.status} with a ${control.priority} priority level and a risk score of ${control.riskScore}/100.`,
        recommendations: [
          `Review and update this control immediately as it is owned by ${control.owner}.`,
          control.riskScore < 70
            ? "Risk score is below 70 — immediate action required to improve."
            : "Risk score is acceptable but can be improved with regular audits.",
          control.priority === "CRITICAL" || control.priority === "HIGH"
            ? "High priority detected — escalate to senior management for review."
            : "Maintain current monitoring frequency for this control.",
        ],
        riskScore: control.riskScore < 50 ? "HIGH" : control.riskScore < 80 ? "MEDIUM" : "LOW",
        nextAction:
          control.status === "OVERDUE"
            ? "Immediate escalation required"
            : control.status === "PENDING"
            ? "Schedule review meeting this week"
            : "Continue regular monitoring",
      });
    }, 2000);
  };

  const handleChatSubmit = () => {
    if (!question.trim()) return;
    const userMessage = question.trim();
    setQuestion("");
    setChatLoading(true);
    setChatHistory((prev) => [...prev, { role: "user", message: userMessage }]);

    setTimeout(() => {
      setChatLoading(false);
      let reply = "";
      if (userMessage.toLowerCase().includes("score") || userMessage.toLowerCase().includes("risk")) {
        reply = `The risk score for "${control.title}" is ${control.riskScore}/100. ${control.riskScore >= 80 ? "This is a good score." : control.riskScore >= 50 ? "This score needs improvement." : "This score is critically low."}`;
      } else if (userMessage.toLowerCase().includes("priority")) {
        reply = `The priority is ${control.priority}. ${control.priority === "CRITICAL" ? "Escalate immediately." : control.priority === "HIGH" ? "Schedule urgent review." : control.priority === "MEDIUM" ? "Monitor closely." : "Standard monitoring applies."}`;
      } else if (userMessage.toLowerCase().includes("status")) {
        reply = `The current status is ${control.status}. ${control.status === "OVERDUE" ? "Immediate action needed!" : control.status === "ACTIVE" ? "Actively being monitored." : control.status === "PENDING" ? "Pending review." : "Currently inactive."}`;
      } else if (userMessage.toLowerCase().includes("owner") || userMessage.toLowerCase().includes("who")) {
        reply = `This control is owned by ${control.owner}. They are the responsible owner.`;
      } else if (userMessage.toLowerCase().includes("recommend")) {
        reply = `I recommend: 1) ${control.riskScore < 70 ? "Urgently improve risk score." : "Maintain current procedures."} 2) ${control.priority === "HIGH" || control.priority === "CRITICAL" ? "Escalate priority to management." : "Continue regular assessments."} 3) Ensure ${control.owner} reviews within 7 days.`;
      } else {
        reply = `"${control.title}" has a risk score of ${control.riskScore}/100, ${control.priority} priority, and is ${control.status}. Owned by ${control.owner}. Ask me about risk, priority, status, or recommendations.`;
      }
      setChatHistory((prev) => [...prev, { role: "ai", message: reply }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ Responsive Navbar */}
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

        {/* ✅ Header Card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#1B4F8A]">{control.title}</h2>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(control.status)}`}>
                {control.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskBadge(control.priority)}`}>
                {control.priority}
              </span>
              <button
                onClick={() => navigate("/edit", { state: control })}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded-lg font-semibold transition text-sm"
              >
                ✏️ Edit
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{control.description}</p>
        </div>

        {/* ✅ 3 Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-sm text-gray-500 mb-2">Risk Score</p>
            <p className="text-4xl font-bold text-[#1B4F8A] mb-3">
              {control.riskScore}<span className="text-lg text-gray-400">/100</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full ${getScoreColor(control.riskScore)}`} style={{ width: `${control.riskScore}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {control.riskScore >= 80 ? "✅ Good" : control.riskScore >= 50 ? "⚠️ Needs Attention" : "❌ Critical"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-sm text-gray-500 mb-2">Current Status</p>
            <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mt-2 ${getStatusBadge(control.status)}`}>
              {control.status}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {control.status === "ACTIVE" && "✅ Currently being monitored"}
              {control.status === "INACTIVE" && "⏸️ Monitoring paused"}
              {control.status === "PENDING" && "⏳ Awaiting review"}
              {control.status === "OVERDUE" && "🚨 Immediate action needed"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-sm text-gray-500 mb-2">Owner</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-10 h-10 rounded-full bg-[#1B4F8A] text-white flex items-center justify-center font-bold text-lg">
                {control.owner.charAt(0).toUpperCase()}
              </div>
              <p className="text-lg font-semibold text-gray-700">{control.owner}</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">Responsible owner</p>
          </div>

        </div>

        {/* ✅ AI Analysis Panel */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#1B4F8A]">🤖 AI Analysis Panel</h3>
            <button
              onClick={handleAskAI}
              disabled={aiLoading}
              className="bg-[#1B4F8A] hover:bg-blue-800 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              {aiLoading ? "Analysing..." : "⚡ Generate AI Report"}
            </button>
          </div>

          {aiLoading && (
            <div className="flex items-center justify-center py-10 gap-3">
              <div className="w-7 h-7 border-4 border-[#1B4F8A] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">AI is analysing this control...</p>
            </div>
          )}

          {aiResponse && !aiLoading && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1B4F8A] mb-2">📋 Summary</p>
                <p className="text-sm text-gray-700">{aiResponse.summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-yellow-700 mb-1">⚠️ AI Risk Assessment</p>
                  <p className="text-2xl font-bold text-yellow-600">{aiResponse.riskScore}</p>
                  <p className="text-xs text-gray-500 mt-1">Based on score and risk level</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-700 mb-1">✅ Recommended Next Action</p>
                  <p className="text-sm font-bold text-green-700">{aiResponse.nextAction}</p>
                  <p className="text-xs text-gray-500 mt-1">AI suggested priority action</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1B4F8A] mb-3">💡 Recommendations</p>
                <ul className="space-y-2">
                  {aiResponse.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 font-bold mt-0.5">{index + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center">
              <p className="text-red-600 text-sm">⚠️ AI service unavailable.</p>
              <button onClick={handleAskAI} className="text-sm text-red-600 underline">Retry</button>
            </div>
          )}

          {!aiResponse && !aiLoading && !aiError && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-5xl mb-3">🤖</div>
              <p className="text-sm">Click <strong className="text-[#1B4F8A]">Generate AI Report</strong> to analyse this control</p>
            </div>
          )}
        </div>

        {/* ✅ AI Chat Panel */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-[#1B4F8A] mb-4">💬 Ask AI About This Control</h3>

          <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto mb-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 mt-16">
                <p className="text-sm">Ask anything about this control</p>
                <p className="text-xs mt-1">Try: "What is the risk?" or "Give recommendations"</p>
              </div>
            )}
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${chat.role === "user" ? "bg-[#1B4F8A] text-white rounded-br-none" : "bg-blue-50 text-gray-700 border border-blue-200 rounded-bl-none"}`}>
                  {chat.role === "ai" && <p className="text-xs font-semibold text-[#1B4F8A] mb-1">🤖 AI</p>}
                  {chat.message}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
              placeholder="Ask about score, risk, status..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleChatSubmit}
              disabled={chatLoading || !question.trim()}
              className="bg-[#1B4F8A] hover:bg-blue-800 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              Send
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {["What is the risk?", "What is the score?", "Who is assigned?", "Give recommendations", "What is the status?"].map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-[#1B4F8A] border border-blue-200 px-3 py-1 rounded-full transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailPage;