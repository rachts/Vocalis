import cron from 'node-cron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export function startMorningDigestJob() {
  cron.schedule('30 7 * * *', async () => {
    try {
      console.log('Running morning digest...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const { data: todos } = await supabase.from('todos').select('text').eq('completed', false);
      const todoList = todos?.map(t => t.text).join(', ') || 'none';
      
      const prompt = `Generate a warm, brief morning digest (under 3 sentences). The user has these pending todos: ${todoList}.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      await supabase.from('digests').upsert({ id: 'latest', text });
      console.log('Morning digest complete:', text);
    } catch (e) {
      console.error('Morning digest failed:', e);
    }
  });
}
