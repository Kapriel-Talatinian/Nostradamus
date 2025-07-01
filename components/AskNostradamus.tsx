import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AskNostradamus() {
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [questionsLeft, setQuestionsLeft] = useState<number>(3);
  const [typedResponse, setTypedResponse] = useState<string>('');
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

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

    // Detect dark mode
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', listener);

    return () => darkModeMediaQuery.removeEventListener('change', listener);
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
    setHistory((prev: { question: string; answer: string }[]) => [
      ...prev,
      { question, answer: data.answer }
    ]);
    setLoading(false);

    const newCount = questionsLeft - 1;
    setQuestionsLeft(newCount);
    localStorage.setItem('nostradamus-questions-left', newCount.toString());
  };

  const typeEffect = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypedResponse((prev: string) => prev + text[index]);
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

  return (
    <div className={`flex items-center justify-center min-h-screen px-4 ${isDarkMode ? 'bg-[#121212]' : 'bg-[#fefcfb]'}`}>
      <div className={`relative ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white text-gray-900'} shadow-xl rounded-2xl max-w-xl w-full p-6 flex flex-col items-center`}>
        {/* Djinn Image positioned over the card */}
        <div className="absolute -left-16 top-12 z-10">
          <Image
            src={getDjinnImage()}
            alt="Djinn Nostradamus"
            width={160}
            height={160}
            className="select-none"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Ask Nostradamus</h1>
        <p className="text-center mb-6">
          You have <span className="font-semibold">{questionsLeft} question{questionsLeft !== 1 ? 's' : ''} remaining today.</span>
        </p>

        <input
          type="text"
          placeholder="Ask a question about any crypto or stock..."
          value={question}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
          className="w-full p-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-gray-900"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || questionsLeft <= 0}
          className="w-full bg-gray-100 text-gray-900 text-base py-3 rounded-xl border border-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
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
          <div className="mt-6 font-mono whitespace-pre-wrap text-sm bg-gray-50 p-5 rounded-xl border border-gray-200 w-full text-gray-800">
            {typedResponse}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 w-full">
            <h2 className="text-base font-semibold mb-2">Prediction History</h2>
            <ul className="space-y-2 text-sm">
              {history.map((item, idx) => (
                <li key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <strong>Q:</strong> {item.question}<br />
                  <strong>A:</strong> {item.answer.slice(0, 100)}...
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="text-xs text-gray-400 mt-6 text-center">
          ✨ This is an AI-powered prediction tool — not financial advice.
        </footer>
      </div>
    </div>
  );
}
