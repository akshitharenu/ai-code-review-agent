"use client";
import { useEffect, useState } from "react";
import { submitReview, getAllReviews, getReview, deleteReview } from "@/lib/api";
import {
  Shield, Bug, Star, FileCode,
  CheckCircle, XCircle, Clock,
  Trash2, ChevronDown, ChevronUp
} from "lucide-react";

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("app.py");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("report");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await getAllReviews();
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await submitReview({ code, filename, language: "auto" });
      setSelectedReview(res.data);
      await fetchReviews();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: string) => {
    const res = await getReview(id);
    setSelectedReview(res.data);
    setExpandedSection("report");
  };

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation();
    await deleteReview(id);
    if (selectedReview?.id === id) setSelectedReview(null);
    await fetchReviews();
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-900 border-green-700";
    if (score >= 50) return "bg-yellow-900 border-yellow-700";
    return "bg-red-900 border-red-700";
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "critical" || severity === "high") return "text-red-400 bg-red-900";
    if (severity === "warning" || severity === "medium") return "text-yellow-400 bg-yellow-900";
    return "text-blue-400 bg-blue-900";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-400 bg-red-900";
    if (priority === "medium") return "text-yellow-400 bg-yellow-900";
    return "text-green-400 bg-green-900";
  };

  const totalReviews = reviews.length;
  const avgScore = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + (r.quality_score || 0), 0) / reviews.length)
    : 0;
  const totalBugs = reviews.reduce((s, r) => s + (r.total_bugs || 0), 0);
  const totalSecurity = reviews.reduce((s, r) => s + (r.total_security || 0), 0);

  const toggle = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCode className="text-blue-400" />
          AI Code Review Agent
        </h1>
        <p className="text-gray-400 text-sm mt-1">Powered by LangGraph + Gemini</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="lg:col-span-1 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <p className="text-gray-400 text-xs">Total Reviews</p>
              <p className="text-2xl font-bold mt-1">{totalReviews}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <p className="text-gray-400 text-xs">Avg Score</p>
              <p className={`text-2xl font-bold mt-1 ${getScoreColor(avgScore)}`}>{avgScore}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <p className="text-gray-400 text-xs flex items-center gap-1"><Bug className="w-3 h-3" /> Bugs</p>
              <p className="text-2xl font-bold mt-1 text-red-400">{totalBugs}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
              <p className="text-gray-400 text-xs flex items-center gap-1"><Shield className="w-3 h-3" /> Security</p>
              <p className="text-2xl font-bold mt-1 text-orange-400">{totalSecurity}</p>
            </div>
          </div>

          {/* Code Input */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="font-semibold mb-3 text-blue-400">📝 Submit Code for Review</h2>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="filename.py"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              rows={10}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing... (may take 30s)
                </>
              ) : (
                "🔍 Review Code"
              )}
            </button>
          </div>

          {/* Reviews List */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="font-semibold">Past Reviews</h2>
              <button onClick={fetchReviews} className="text-xs text-gray-400 hover:text-white">
                🔄 Refresh
              </button>
            </div>
            {fetching ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
            ) : reviews.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No reviews yet</div>
            ) : (
              <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className={`p-3 cursor-pointer hover:bg-gray-800 transition ${selectedReview?.id === r.id ? "bg-gray-800 border-l-2 border-blue-500" : ""}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-400 truncate">{r.filename}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${getScoreColor(r.quality_score)}`}>
                          {r.quality_score}/100
                        </span>
                        <button onClick={(e) => handleDelete(r.id, e)}>
                          <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span className="text-red-400">🐛 {r.total_bugs} bugs</span>
                      <span className="text-orange-400">🔒 {r.total_security} issues</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Review Results */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedReview ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 text-center text-gray-400">
              <FileCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Submit code or select a past review to see results</p>
            </div>
          ) : (
            <>
              {/* Score Card */}
              <div className={`rounded-xl border p-5 ${getScoreBg(selectedReview.quality_score)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedReview.filename}</h2>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-red-400 flex items-center gap-1">
                        <Bug className="w-4 h-4" /> {selectedReview.total_bugs} bugs
                        {selectedReview.critical_bugs > 0 && (
                          <span className="text-xs bg-red-800 px-1 rounded">
                            {selectedReview.critical_bugs} critical
                          </span>
                        )}
                      </span>
                      <span className="text-orange-400 flex items-center gap-1">
                        <Shield className="w-4 h-4" /> {selectedReview.total_security} security
                        {selectedReview.critical_security > 0 && (
                          <span className="text-xs bg-orange-800 px-1 rounded">
                            {selectedReview.critical_security} critical
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(selectedReview.quality_score)}`}>
                      {selectedReview.quality_score}
                    </div>
                    <div className="text-gray-400 text-sm">/ 100</div>
                  </div>
                </div>
              </div>

              {/* Final Report */}
              <div className="bg-gray-900 rounded-xl border border-gray-800">
                <button
                  onClick={() => toggle("report")}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-800 transition rounded-xl"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" /> Final Report
                  </h3>
                  {expandedSection === "report" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSection === "report" && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedReview.final_report}
                    </p>
                  </div>
                )}
              </div>

              {/* Bugs */}
              <div className="bg-gray-900 rounded-xl border border-gray-800">
                <button
                  onClick={() => toggle("bugs")}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-800 transition rounded-xl"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bug className="w-4 h-4 text-red-400" />
                    Bugs ({selectedReview.bugs?.length || 0})
                  </h3>
                  {expandedSection === "bugs" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSection === "bugs" && (
                  <div className="px-4 pb-4 space-y-3">
                    {selectedReview.bugs?.length === 0 ? (
                      <p className="text-green-400 text-sm">✅ No bugs found!</p>
                    ) : (
                      selectedReview.bugs?.map((bug: any, i: number) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(bug.severity)}`}>
                              {bug.severity}
                            </span>
                            <span className="text-sm font-medium">{bug.type}</span>
                            {bug.line && <span className="text-xs text-gray-500">Line {bug.line}</span>}
                          </div>
                          <p className="text-gray-300 text-sm">{bug.description}</p>
                          <p className="text-green-400 text-xs mt-1">💡 Fix: {bug.fix}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Security */}
              <div className="bg-gray-900 rounded-xl border border-gray-800">
                <button
                  onClick={() => toggle("security")}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-800 transition rounded-xl"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    Security Issues ({selectedReview.security_issues?.length || 0})
                  </h3>
                  {expandedSection === "security" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSection === "security" && (
                  <div className="px-4 pb-4 space-y-3">
                    {selectedReview.security_issues?.length === 0 ? (
                      <p className="text-green-400 text-sm">✅ No security issues found!</p>
                    ) : (
                      selectedReview.security_issues?.map((issue: any, i: number) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className="text-sm font-medium">{issue.type}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{issue.description}</p>
                          <p className="text-green-400 text-xs mt-1">💡 Fix: {issue.fix}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="bg-gray-900 rounded-xl border border-gray-800">
                <button
                  onClick={() => toggle("suggestions")}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-800 transition rounded-xl"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    💡 Suggestions ({selectedReview.suggestions?.length || 0})
                  </h3>
                  {expandedSection === "suggestions" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSection === "suggestions" && (
                  <div className="px-4 pb-4 space-y-3">
                    {selectedReview.suggestions?.map((s: any, i: number) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(s.priority)}`}>
                            {s.priority}
                          </span>
                          <span className="text-sm font-medium">{s.title}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{s.description}</p>
                        {s.original_code && (
                          <div className="mb-2">
                            <p className="text-xs text-red-400 mb-1">❌ Before:</p>
                            <pre className="bg-gray-900 rounded p-2 text-xs text-red-300 overflow-x-auto">
                              {s.original_code}
                            </pre>
                          </div>
                        )}
                        {s.fixed_code && (
                          <div>
                            <p className="text-xs text-green-400 mb-1">✅ After:</p>
                            <pre className="bg-gray-900 rounded p-2 text-xs text-green-300 overflow-x-auto">
                              {s.fixed_code}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}