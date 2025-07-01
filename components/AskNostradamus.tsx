import { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AskNostradamus() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(3);
  const [typedResponse, setTypedResponse] = useState('');
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedCount = localStorage.getItem('nostradamus-questions-left');
    const savedDate = localStorage.getItem('nostradamus-date');
    const today = new Date().toLocaleDateString();
    if (savedDate !== today) {
      localStorage.setItem('nostradamus-date', today);
      localStorage.setItem('nostradamus-questions-left', '3');
      setQuestionsLeft(3);
    } else if (savedCount !== null) {
      setQuestionsLeft(parseInt(savedCount));
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);

  const playSound = () => {
    const audio = new Audio('/ding.mp3');
    audio.play();
  };

  const handleSubmit = async () => {
    if (!question || questionsLeft <= 0) return;
    setLoading(true);
    setResponse('');
    setTypedResponse('');

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    setResponse(data.answer);
    typeEffect(data.answer);
    playSound();
    setHistory((prev) => [...prev, { question, answer: data.answer }]);
    setLoading(false);

    const newCount = questionsLeft - 1;
    setQuestionsLeft(newCount);
    localStorage.setItem('nostradamus-questions-left', newCount.toString());
  };

  const typeEffect = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypedResponse((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  };

  const getDjinnImage = () => {
    switch (questionsLeft) {
      case 3:
        return '/djinn-3.png';
      case 2:
        return '/djinn-2.png';
      case 1:
        return '/djinn-1.png';
      default:
        return '/djinn-0.png';
    }
  };

  const bg = darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-white to-gray-100 text-[#222]';
  const card = darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-[#222] border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${bg} p-4`}>
      <div className={`w-full max-w-2xl ${card} rounded-2xl shadow-xl p-6 relative overflow-hidden`}>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-[-60px] top-4"
        >
          <Image
            src={getDjinnImage()}
            alt="Djinn Nostradamus"
            width={120}
            height={120}
            className="select-none"
            priority
          />
        </motion.div>

        <div className="absolute right-4 top-4 text-yellow-400">
          <Sparkles size={28} />
        </div>

        <h1 className="text-4xl font-bold text-center mb-2">Ask Nostradamus</h1>
        <p className={`text-center ${textMuted} mb-6`}>
          You have <span className="font-semibold">{questionsLeft} question{questionsLeft !== 1 ? 's' : ''} remaining today.</span>
        </p>

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔮</span>
          <input
            type="text"
            placeholder="Ask a question about any crypto or stock..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            inputMode="text"
            autoFocus
            className="w-full pl-10 p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || questionsLeft <= 0}
          className="w-full bg-indigo-600 text-white text-lg py-3 rounded-xl hover:shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? (
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Thinking...
            </div>
          ) : (
            questionsLeft > 0 ? 'Ask' : 'No questions left'
          )}
        </button>

        {typedResponse && (
          <div role="alert" className={`mt-8 font-mono whitespace-pre-wrap text-sm bg-gray-50 p-5 rounded-xl border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-800 border-gray-200'} shadow-sm`}>
            {typedResponse}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Prediction History</h2>
            <ul className="space-y-2 text-sm">
              {history.map((item, idx) => (
                <li key={idx} className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  <strong>Q:</strong> {item.question}<br />
                  <strong>A:</strong> {item.answer.slice(0, 100)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className={`text-xs mt-6 text-center ${textMuted}`}>
        ✨ This is an AI-powered prediction tool — not financial advice.
      </footer>
    </div>
  );
}
