import { useEffect, useState } from 'react';
import DjinnIllustration from './DjinnIllustration';
import ResultBlock from './ResultBlock';

const MAX_WISHES = 3;

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [wishes, setWishes] = useState(MAX_WISHES);

  useEffect(() => {
    const stored = localStorage.getItem('wishesInfo');
    if (stored) {
      const info = JSON.parse(stored);
      const last = new Date(info.date);
      const now = new Date();
      if (last.toDateString() !== now.toDateString()) {
        setWishes(MAX_WISHES);
        localStorage.setItem('wishesInfo', JSON.stringify({ date: now, wishes: MAX_WISHES }));
      } else {
        setWishes(info.wishes);
      }
    } else {
      const now = new Date();
      localStorage.setItem('wishesInfo', JSON.stringify({ date: now, wishes: MAX_WISHES }));
    }
  }, []);

  const ask = async () => {
    if (!question.trim() || wishes <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      if (data.answer) setAnswer(data.answer);
      const info = JSON.parse(localStorage.getItem('wishesInfo') || '{}');
      const newWishes = (info.wishes || MAX_WISHES) - 1;
      const now = new Date();
      localStorage.setItem('wishesInfo', JSON.stringify({ date: now, wishes: newWishes }));
      setWishes(newWishes);
    } catch (err) {
      setAnswer('Erreur lors de la requête.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-purple-800 via-indigo-800 to-blue-900 text-gray-200">
      <h1 className="text-3xl font-bold mb-4">Ask Nostradamus</h1>
      <DjinnIllustration wishes={wishes} />
      <p className="text-sm italic mb-2">Vous avez {wishes} vœux restants aujourd'hui.</p>
      <textarea
        className="w-full p-2 border rounded-lg mb-2 text-gray-900"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Posez votre question..."
      />
      <button
        className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
        onClick={ask}
        disabled={loading || wishes <= 0}
      >
        {loading ? 'Consultation...' : 'Poser la question'}
      </button>
      {wishes <= 0 && <p className="mt-2 text-red-500">Plus de vœux aujourd'hui ! Revenez demain.</p>}
      <ResultBlock text={answer} />
      <p className="mt-8 text-xs text-gray-500">Ce n’est pas un conseil financier.</p>
    </div>
  );
}
