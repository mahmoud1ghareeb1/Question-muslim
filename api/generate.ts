import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This function will be executed on the server, where process.env is securely available.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
      return res.status(500).json({ error: 'مفتاح API غير معرف على الخادم. الرجاء التأكد من إضافته في إعدادات Vercel.' });
  }

  // Initialize the AI client inside the handler with the securely obtained API key.
  const ai = new GoogleGenAI({ apiKey });

  const { contents, config } = req.body;

  if (!contents || !config) {
    return res.status(400).json({ error: 'الطلب يجب أن يحتوي على "contents" و "config".' });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: config,
    });
    
    const text = response.text;
    
    // Send back a JSON object with the text property, which the client expects.
    res.status(200).json({ text });

  } catch (error: any) {
    console.error("Error in serverless function:", error);
    res.status(500).json({ error: error.message || 'حدث خطأ داخلي أثناء الاتصال بخدمة Gemini.' });
  }
}
