import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { systemPrompt } from '../../utils/prompt';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question manquante' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const answer = completion.choices[0].message?.content || '';
    res.status(200).json({ answer });
  } catch (e: any) {
    res.status(500).json({ error: 'Erreur IA', detail: e.message });
  }
}
