import { useState, useEffect, useRef } from 'react';
import ResultBlock from './ResultBlock';
import DjinnIllustration from './DjinnIllustration';

export default function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [wishes, setWishes] = useState(3);
  const [placeholder, setPlaceholder] = useState('Posez votre question...');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    const suggestions = [
      'Quelle est la tendance du Bitcoin ?',
      'Le Nasdaq va-t-il monter ?',
      'ETH va dépasser 3000$ ?'
    ];
    setPlaceholder(
      suggestions[Math.floor(Math.random() * suggestions.length)]
    );

    const today = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem('nostradamus-date');
    let remaining = 3;
    if (storedDate === today) {
      const saved = parseInt(
        localStorage.getItem('nostradamus-wishes') || '3',
        10
      );
      remaining = isNaN(saved) ? 3 : saved;
    } else {
      localStorage.setItem('nostradamus-date', today);
    }
    setWishes(remaining);
    inputRef.current?.focus();
  }, []);

  const ask = async () => {
    if (!input.trim()) return;
    if (wishes <= 0) {
      setHistory((h) => [
        ...h,
        { question: input, answer: "Tu n'as plus de vœux pour aujourd'hui." }
      ]);
      setInput('');
      return;
    }
    const question = input;
    setInput('');
    setLoading(true);
    setHistory((h) => [...h, { question, answer: '' }]);
    const today = new Date().toISOString().split('T')[0];
    const newCount = wishes - 1;
    setWishes(newCount);
    localStorage.setItem('nostradamus-wishes', newCount.toString());
    localStorage.setItem('nostradamus-date', today);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setHistory((h) => {
        const updated = [...h];
        updated[updated.length - 1].answer = data.answer || 'Erreur';
        return updated;
      });
    } catch (err) {
      setHistory((h) => {
        const updated = [...h];
        updated[updated.length - 1].answer = 'Erreur lors de la requête.';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#343541] text-gray-800 dark:text-gray-100">
      <nav className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="font-bold">Nostradamus</h1>
        <button className="text-sm" onClick={() => setShowHistory(!showHistory)}>Historique</button>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center">
        <DjinnIllustration wishes={wishes} />
        {wishes <= 0 && (
          <p className="text-sm text-red-600">Vous avez épuisé vos vœux pour aujourd'hui.</p>
        )}
        {history.map((msg, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="rounded-md p-3 bg-white dark:bg-[#444654] max-w-[80%]">
                {msg.question}
              </div>
            </div>
            {msg.answer && (
              <div className="flex justify-start">
                <ResultBlock text={msg.answer} />
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Consultation...</div>}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex sticky bottom-0 bg-gray-100 dark:bg-[#343541]">
        <textarea
          ref={inputRef}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
        />
        <button
          onClick={ask}
          disabled={loading}
          className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>

      {showHistory && (
        <div className="absolute inset-0 bg-black/50 flex justify-end">
          <div className="bg-white dark:bg-gray-800 w-64 p-4 overflow-y-auto">
            <h2 className="font-bold mb-2">Historique</h2>
            {history.map((m, idx) => (
              <div key={idx} className="mb-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400 truncate">{m.question}</p>
              </div>
            ))}
          </div>
          <div className="flex-1" onClick={() => setShowHistory(false)} />
        </div>
      )}
    </div>
  );
}
