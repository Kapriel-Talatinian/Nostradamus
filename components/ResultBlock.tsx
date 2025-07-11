import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ResultBlock({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  if (!text) return null;

  return (
    <pre className="whitespace-pre-wrap mt-4 p-4 w-full bg-black/70 text-green-200 rounded-lg shadow-lg border border-purple-400">
      <ReactMarkdown>{displayed}</ReactMarkdown>
    </pre>
  );
}
