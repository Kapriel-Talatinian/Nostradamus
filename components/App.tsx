import { useState, useEffect, useRef } from 'react';
import ResultBlock from './ResultBlock';

export default function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const ask = async () => {
    if (!input.trim()) return;
    const question = input;
    setInput('');
    setLoading(true);
    setHistory((h) => [...h, { question, answer: '' }]);
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
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
