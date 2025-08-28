import { Level, Question, RandomQuizSettings } from '../types';
import { Type } from "@google/genai";

// The schema is defined on the client and sent to the serverless function.
// This ensures consistency and allows the client to know what to expect.
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

// This function now calls our secure server-side proxy instead of the Gemini SDK.
const generateContentWithSchema = async (prompt: string): Promise<Omit<Question, 'id'>[]> => {
    
    // The payload for our proxy API. We send the prompt and the desired schema.
    const requestBody = {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: questionSchema,
        }
    };
    
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        // Display the specific error message from the server proxy.
        throw new Error(errorData.error || 'فشل الاتصال بالخادم.');
    }

    // The proxy returns a JSON object like { text: "..." }
    const data = await response.json();
    const jsonString = data.text;

    if (!jsonString) {
        throw new Error("الخادم لم يرجع أي بيانات. قد تكون هناك مشكلة في مفتاح API.");
    }

    try {
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
        console.error("Failed to parse JSON response from proxy:", jsonString, parseError);
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
    console.error("Error generating questions for a level via proxy:", error);
    // Re-throw the more specific error from the proxy call
    throw error;
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
        console.error("Error generating random questions via proxy:", error);
        // Re-throw the more specific error from the proxy call
        throw error;
    }
};
