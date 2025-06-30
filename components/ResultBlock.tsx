import { useEffect, useState } from 'react';

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
    <pre className="whitespace-pre-wrap mt-4 p-4 w-full bg-white rounded shadow">
      {displayed}
    </pre>
  );
}
