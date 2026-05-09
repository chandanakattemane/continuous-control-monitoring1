import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area
} from "recharts";
import Navbar from "../components/Navbar";
import API from "../services/api";

const COLORS = ["#1B4F8A", "#22c55e", "#f97316", "#ef4444", "#a855f7"];

const AnalyticsPage = () => {
  const [allControls, setAllControls] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("ALL");
  const [statusData, setStatusData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [scoreData, setScoreData] = useState([]);
  const [assigneeData, setAssigneeData] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, active: 0, overdue: 0, critical: 0, avgScore: 0, highRisk: 0 });

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const response = await API.get("/api/controls?size=100");
        setAllControls(response.data.content || []);
      } catch (err) {
        console.error("Failed to fetch controls", err);
      } finally {
        setLoading(false);
      }
    };
    fetchControls();
  }, []);

 useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("controls")) || [];
    let filtered = stored;
    if (period === "ACTIVE") filtered = stored.filter((c) => c.status === "ACTIVE");
    else if (period === "OVERDUE") filtered = stored.filter((c) => c.status === "OVERDUE");
    else if (period === "HIGH_RISK") filtered = stored.filter((c) => c.priority === "HIGH" || c.priority === "CRITICAL");

    setControls(filtered);

    const avgScore = filtered.length > 0
      ? Math.round(filtered.reduce((sum, c) => sum + Number(c.riskScore), 0) / filtered.length)
      : 0;

    setKpis({
      total: filtered.length,
      active: filtered.filter((c) => c.status === "ACTIVE").length,
      overdue: filtered.filter((c) => c.status === "OVERDUE").length,
      critical: filtered.filter((c) => c.priority === "CRITICAL").length,
      avgScore,
      highRisk: filtered.filter((c) => c.priority === "HIGH" || c.priority === "CRITICAL").length,
    });

    const statusMap = {};
    filtered.forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
    setStatusData(Object.keys(statusMap).map((key) => ({ name: key, count: statusMap[key] })));

    const riskMap = {};
    filtered.forEach((c) => { riskMap[c.priority] = (riskMap[c.priority] || 0) + 1; });
    setRiskData(Object.keys(riskMap).map((key) => ({ name: key, value: riskMap[key] })));

    setScoreData(filtered.map((c) => ({
      name: c.title.length > 12 ? c.title.substring(0, 12) + "..." : c.title,
      score: Number(c.riskScore),
      target: 80,
    })));

    const assigneeMap = {};
    filtered.forEach((c) => { assigneeMap[c.owner] = (assigneeMap[c.owner] || 0) + 1; });
    setAssigneeData(Object.keys(assigneeMap).map((key) => ({
      name: key.length > 10 ? key.substring(0, 10) + "..." : key,
      controls: assigneeMap[key],
    })));
  }, [period]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow text-sm">
          <p className="font-semibold text-[#1B4F8A]">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ Responsive Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* ✅ Header + Period Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B4F8A]">📊 Analytics</h2>
            <p className="text-gray-500 text-sm mt-1">Visual breakdown of all your controls</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Filter:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="ALL">All Controls</option>
              <option value="ACTIVE">Active Only</option>
              <option value="OVERDUE">Overdue Only</option>
              <option value="HIGH_RISK">High Risk Only</option>
            </select>
          </div>
        </div>

        {/* ✅ KPI Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Total", value: kpis.total, color: "border-blue-500", text: "text-[#1B4F8A]" },
            { label: "Active", value: kpis.active, color: "border-green-500", text: "text-green-600" },
            { label: "Overdue", value: kpis.overdue, color: "border-red-500", text: "text-red-600" },
            { label: "Critical", value: kpis.critical, color: "border-purple-500", text: "text-purple-600" },
            { label: "High Risk", value: kpis.highRisk, color: "border-yellow-500", text: "text-yellow-600" },
            { label: "Avg Score", value: kpis.avgScore, color: "border-orange-500", text: "text-orange-600" },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-white rounded-2xl shadow p-4 text-center border-t-4 ${kpi.color}`}>
              <p className={`text-2xl md:text-3xl font-bold ${kpi.text}`}>{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* ✅ No data state */}
        {controls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-semibold mb-2">No data available</p>
            <p className="text-sm mb-6">Add some controls to see analytics</p>
          </div>
        ) : (
          <>
            {/* ✅ Row 1 — Bar + Pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-base font-bold text-gray-700 mb-4">📊 Controls by Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-base font-bold text-gray-700 mb-4">🎯 Controls by Risk Level</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40} paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ✅ Line Chart */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-base font-bold text-gray-700 mb-1">📈 Compliance Score per Control</h3>
              <p className="text-xs text-gray-400 mb-4">Red dotted line = target score of 80</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#1B4F8A" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ✅ Area + Assignee Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-base font-bold text-gray-700 mb-4">🌊 Score Area Overview</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={scoreData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B4F8A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1B4F8A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#1B4F8A" strokeWidth={2} fill="url(#scoreGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-base font-bold text-gray-700 mb-4">👤 Controls per Assignee</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={assigneeData} barSize={35}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="controls" fill="#a855f7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ✅ Score Summary Table */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-base font-bold text-gray-700 mb-4">📋 Score Summary Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1B4F8A] text-white">
                      <th className="text-left px-4 py-2 rounded-tl-lg">Control</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Priority</th>
                      <th className="text-left px-4 py-2">Risk Score</th>
                      <th className="text-left px-4 py-2 rounded-tr-lg">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-blue-50 transition">
                        <td className="px-4 py-2 font-medium text-gray-800">{c.title}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === "ACTIVE" ? "bg-green-100 text-green-700" : c.status === "OVERDUE" ? "bg-red-100 text-red-700" : c.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.priority === "CRITICAL" ? "bg-red-100 text-red-700" : c.priority === "HIGH" ? "bg-orange-100 text-orange-700" : c.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${c.riskScore >= 80 ? "bg-green-500" : c.riskScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${c.riskScore}%` }} />
                            </div>
                            <span className="font-semibold text-gray-700">{c.riskScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-lg">
                          {c.riskScore >= 80 ? "✅" : c.riskScore >= 50 ? "⚠️" : "❌"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;