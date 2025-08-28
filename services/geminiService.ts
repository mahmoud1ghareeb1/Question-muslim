import { GoogleGenAI, Type } from "@google/genai";
import { Level, Question, RandomQuizSettings } from '../types';

let ai: GoogleGenAI | null = null;

// This function initializes the Gemini client on its first use.
// This prevents a module-level crash if process.env.API_KEY is not available at load time.
const getAiClient = (): GoogleGenAI => {
  if (ai) {
    return ai;
  }

  // IMPORTANT: This key is managed externally and should not be modified.
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    // This error will now be caught by the component's try/catch block
    // instead of crashing the entire application, thus preventing the blank screen.
    throw new Error("متغير البيئة API_KEY غير موجود. في بيئة المتصفح، لا يمكن الوصول إلى 'process.env' مباشرة. تأكد من أن بيئة النشر (مثل Vercel) مهيأة بشكل صحيح لإتاحة المفتاح للـ frontend.");
  }

  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
};


const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: 'نص السؤال باللغة العربية',
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'قائمة من أربعة خيارات محتملة باللغة العربية. يجب أن تكون واحدة منها صحيحة.',
      },
      correctAnswer: {
        type: Type.STRING,
        description: 'نص الإجابة الصحيحة من قائمة الخيارات.',
      },
    },
    required: ['question', 'options', 'correctAnswer'],
  },
};

const generateContentWithSchema = async (prompt: string): Promise<Omit<Question, 'id'>[]> => {
    const client = getAiClient(); // Get the initialized client.
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: questionSchema,
        },
    });

    try {
        const jsonString = response.text.trim();
        const questions = JSON.parse(jsonString);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("API returned an empty or invalid array of questions.");
        }
        
        questions.forEach(q => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                throw new Error("Invalid question format received from API.");
            }
        });

        return questions;
    } catch (parseError) {
        console.error("Failed to parse JSON response from Gemini:", response.text, parseError);
        throw new Error("فشل في معالجة الاستجابة من الخادم. قد تكون الاستجابة ليست بتنسيق JSON صحيح.");
    }
};

export const generateQuestions = async (level: Level, count: number): Promise<Omit<Question, 'id'>[]> => {
  try {
    const prompt = `
      أنت خبير في العلوم الإسلامية ومصمم ألعاب تعليمية. 
      مهمتك هي إنشاء ${count} أسئلة اختيار من متعدد باللغة العربية.
      الموضوع المحدد هو: '${level.title}'.
      وصف الموضوع هو: '${level.description}'.
      مستوى الصعوبة المطلوب هو: '${level.difficulty}'.
      
      إرشادات هامة:
      1.  يجب أن تكون جميع الأسئلة مرتبطة بشكل مباشر بالموضوع المحدد ووصفه.
      2.  يجب أن يكون لكل سؤال أربعة خيارات، وإجابة واحدة صحيحة فقط.
      3.  تأكد من أن الأسئلة متنوعة وواضحة ومناسبة لمستوى الصعوبة المحدد.
      4.  استخدم معلومات من مصادر إسلامية موثوقة مثل القرآن الكريم، والسنة النبوية الصحيحة، وكتب السيرة المعتبرة.
      
      الرجاء تنسيق الإخراج كـ JSON فقط، بدون أي نص إضافي قبله أو بعده. 
      يجب أن يتوافق الإخراج تمامًا مع مخطط JSON المحدد.
    `;
    return await generateContentWithSchema(prompt);
  } catch (error) {
    console.error("Error generating questions for a level with Gemini API:", error);
    // Re-throw the original, more specific error
    throw error instanceof Error ? error : new Error("فشل في توليد الأسئلة. الرجاء المحاولة مرة أخرى.");
  }
};

export const generateRandomQuestions = async (settings: RandomQuizSettings): Promise<Omit<Question, 'id'>[]> => {
    try {
        const prompt = `
          أنت خبير في العلوم الإسلامية ومصمم ألعاب تعليمية.
          مهمتك هي إنشاء ${settings.count} أسئلة اختيار من متعدد عشوائية ومتنوعة باللغة العربية.
          مستوى الصعوبة المطلوب هو: '${settings.difficulty}'.
          
          إرشادات هامة:
          1.  يجب أن تغطي الأسئلة مجموعة واسعة من المواضيع الإسلامية مثل: (السيرة النبوية، قصص الأنبياء، الصحابة، الفقه، العقيدة، علوم القرآن، التاريخ الإسلامي).
          2.  يجب أن يكون لكل سؤال أربعة خيارات، وإجابة واحدة صحيحة فقط.
          3.  تأكد من أن الأسئلة متنوعة وواضحة ومناسبة لمستوى الصعوبة المحدد.
          4.  استخدم معلومات من مصادر إسلامية موثوقة.
          
          الرجاء تنسيق الإخراج كـ JSON فقط، بدون أي نص إضافي قبله أو بعده. 
          يجب أن يتوافق الإخراج تمامًا مع مخطط JSON المحدد.
        `;
        return await generateContentWithSchema(prompt);
    } catch (error) {
        console.error("Error generating random questions with Gemini API:", error);
        // Re-throw the original, more specific error
        throw error instanceof Error ? error : new Error("فشل في توليد الأسئلة العشوائية. الرجاء المحاولة مرة أخرى.");
    }
};
