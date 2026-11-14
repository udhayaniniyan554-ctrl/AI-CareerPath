import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  X, 
  HelpCircle,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function AssessmentsPage({ setActivePage }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await api.assessments.list();
      setAssessments(res || []);
    } catch (err) {
      console.error("Assessments list error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Timer countdown when active quiz is running
  useEffect(() => {
    if (!activeQuiz || quizResult) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, quizResult]);

  const handleStartQuiz = async (assessmentId) => {
    try {
      setLoading(true);
      const fullQuiz = await api.assessments.get(assessmentId);
      setActiveQuiz(fullQuiz);
      setSelectedAnswers({});
      setQuizResult(null);
      setTimeLeft((fullQuiz.duration_minutes || 15) * 60);
    } catch (err) {
      alert("Error starting quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
        question_id: parseInt(qId),
        selected_option_index: optIdx
      }));

      for (const q of activeQuiz.questions) {
        if (selectedAnswers[q.id] === undefined) {
          formattedAnswers.push({
            question_id: q.id,
            selected_option_index: -1
          });
        }
      }

      const result = await api.assessments.submit(activeQuiz.id, formattedAnswers);
      setQuizResult(result);
      await fetchAssessments();
    } catch (err) {
      alert("Error submitting quiz: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading && !activeQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#A1A1AA]">Loading Assessment Question Banks...</span>
      </div>
    );
  }

  // -------------------------------------------------------------
  // View 1: Quiz Result Review Modal / View
  // -------------------------------------------------------------
  if (quizResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
        
        {/* Score Banner */}
        <div className={`p-8 rounded-2xl border ${
          quizResult.passed 
            ? 'border-emerald-800 bg-[#0E1C14] text-[#E0F2E9]' 
            : 'border-amber-800 bg-[#1C160B] text-[#FDF4E7]'
        } shadow-subtle space-y-4`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                quizResult.passed ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'
              }`}>
                {quizResult.passed ? 'VERIFIED PASS' : 'NEEDS REVISION'}
              </span>
              <h2 className="text-2xl font-extrabold mt-2 text-white font-display">
                Assessment Results: {quizResult.title}
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Completed {quizResult.correct_count} of {quizResult.total_questions} questions correctly (Pass threshold: {quizResult.pass_score}%).
              </p>
            </div>

            <div className="text-right">
              <span className="text-4xl font-black font-mono block text-white">{quizResult.score}%</span>
              <span className="text-[11px] font-mono text-[#A1A1AA]">Calculated Score</span>
            </div>
          </div>

          {/* Adaptive Intervention Alert */}
          {quizResult.roadmap_updated && (
            <div className="p-4 rounded-xl bg-[#2A1E0C] border border-amber-700/80 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Autonomous Agent Intervention Triggered</span>
              </div>
              <p className="leading-relaxed">
                Because your score was below 70%, our Progress Tracking Agent automatically inserted targeted remediation tasks into your active roadmap. Review the concepts below and consult your AI Mentor.
              </p>
            </div>
          )}

          {quizResult.passed && (
            <div className="p-4 rounded-xl bg-[#0E2417] border border-emerald-700/80 text-xs text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Proficiency Upgraded</span>
              </div>
              <p className="leading-relaxed">
                Your skill record has been promoted to Verified. Your readiness percentage has increased!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setActiveQuiz(null); setQuizResult(null); }}
              className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors"
            >
              Return to Catalog
            </button>
            <button
              onClick={() => setActivePage('roadmap')}
              className="px-5 py-2.5 rounded-xl border border-white/40 text-white hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              View Updated Roadmap
            </button>
          </div>

        </div>

        {/* Detailed Question Answers & Explanations */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-2 border-b border-[#262626]">
            Diagnostic Question Breakdown
          </h3>

          {quizResult.answers_evaluation?.map((ans, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-2xl border ${
                ans.is_correct ? 'border-emerald-900 bg-[#101010]' : 'border-amber-900 bg-[#101010]'
              } space-y-3 shadow-subtle`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1C1C1C] text-white">
                    Q{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">
                    Skill: {ans.skill_tested}
                  </span>
                </div>
                {ans.is_correct ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Correct
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Incorrect
                  </span>
                )}
              </div>

              <h4 className="text-sm font-semibold text-white">
                {ans.question_text}
              </h4>

              {/* Explanation box */}
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-[#A1A1AA] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-white block">
                  Concept Explanation:
                </span>
                <p className="leading-relaxed">{ans.explanation}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // View 2: Active Quiz Test Runner
  // -------------------------------------------------------------
  if (activeQuiz) {
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQ = activeQuiz.questions.length;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
        
        {/* Sticky Quiz Header */}
        <div className="sticky top-20 z-30 p-4 rounded-2xl border border-[#292929] bg-[#101010]/95 backdrop-blur shadow-premium flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white truncate font-display">{activeQuiz.title}</h2>
            <span className="text-xs text-[#A1A1AA]">
              Answered {answeredCount} of {totalQ} questions
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white">
              <Clock className="w-4 h-4 text-white" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Evaluating...' : 'Submit Answers'}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {activeQuiz.questions.map((q, qIndex) => {
            const selectedOpt = selectedAnswers[q.id];

            return (
              <div 
                key={q.id}
                className="p-6 rounded-2xl border border-[#262626] bg-[#101010] shadow-subtle space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-black">
                    Question 0{qIndex + 1}
                  </span>
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">
                    Testing: {q.skill_tested}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {q.question_text}
                </h3>

                {/* 4 Multiple Choice Options */}
                <div className="space-y-2.5 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isChosen = (selectedOpt === optIdx);
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isChosen
                            ? 'border-white bg-white text-black font-semibold shadow-sm'
                            : 'border-[#292929] bg-[#141414] text-[#D4D4D8] hover:border-white hover:bg-[#1A1A1A]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                          isChosen ? 'bg-black text-white' : 'bg-[#222222] text-[#A1A1AA]'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed mt-0.5">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Submit */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-[#292929] bg-[#101010]">
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-xs text-[#A1A1AA] hover:text-white underline"
          >
            Cancel Quiz
          </button>

          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Analyzing Responses...' : 'Finish & View Diagnostics'}
          </button>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // View 3: Assessments Catalog
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#F5F5F5]">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Interactive Skill Assessment Center
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Validate technical proficiencies through realistic quizzes. Scores feed directly into your Skill Gap Index.
          </p>
        </div>

        <button
          onClick={fetchAssessments}
          className="px-3.5 py-1.5 rounded-xl border border-[#292929] hover:border-white text-xs font-medium text-white bg-[#101010] transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Quizzes</span>
        </button>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((quiz) => (
          <div 
            key={quiz.id}
            className="p-6 rounded-2xl border border-[#262626] hover:border-white transition-all bg-[#101010] flex flex-col justify-between shadow-subtle hover:shadow-cardHover group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
                  {quiz.category}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-white font-semibold">
                  {quiz.difficulty}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-white mb-2 font-display">
                {quiz.title}
              </h3>

              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
                {quiz.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#71717A] font-mono pt-2 border-t border-[#222222] mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>{quiz.duration_minutes} Mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>Pass: {quiz.pass_score}%</span>
                </div>
              </div>

              {quiz.user_best_score !== null && (
                <div className="mb-4 p-2 rounded-xl bg-[#151515] border border-[#292929] flex items-center justify-between text-xs">
                  <span className="text-[#A1A1AA]">Your Best Score:</span>
                  <span className={`font-mono font-bold ${
                    quiz.user_has_passed ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {quiz.user_best_score}% {quiz.user_has_passed ? '(Verified)' : ''}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleStartQuiz(quiz.id)}
              className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{quiz.user_best_score !== null ? 'Retake Assessment' : 'Start Assessment'}</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
