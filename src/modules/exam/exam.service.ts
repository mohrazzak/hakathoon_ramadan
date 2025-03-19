import { BadRequestException, flatten, Injectable } from '@nestjs/common'
import { AIService } from '../ai/ai.service'
import { ExamDto } from './dto/generate.dto'
import {
  QuestionGroup,
  QuestionGroupType,
} from './entity/question-group.entity'
import { pdfToText } from 'pdf-ts'
import ollama from 'ollama'
@Injectable()
export class ExamService {
  constructor(private readonly aiService: AIService) {}

  async generateQuestionGroup(
    questionGroup: QuestionGroup,
    text: string,
    lang = 'english',
  ) {
    // Define the prompt templates for each question type
    const multipleChoiceInput = `
    TEXT: ${text}

    Generate from the previous text ${questionGroup.count} multiple-choice questions with ${questionGroup.choicesCount} choices for each question
     1. Do not include ordering or numbering in the choices. For example, this format is incorrect: "1. first choice". The correct format is: "first choice".
     Respond using Following JSON :
     [{ "question": "question text here", "choices": ["array of choices"], "answer": "correct choice" }]
     Output only the JSON object. Do not include any descriptive text, prefixes, or additional words like 'JSON' in the response. Start directly with the JSON object and ensure strict schema compliance
     the questions and answers should be in the ${lang} language
     `

    const trueFalseInput = `
    TEXT: ${text}

    Generate from the previous text ${questionGroup.count} true/false questions. Follow these guidelines:
    1. Focus on the core concepts and main ideas of the text.
    2. Structure the questions to resemble a real exam, with clear and concise wording.
    3. Provide only the statement itself without adding "true or false" or any similar phrase. Only include the statement.
    Respond using Following JSON :
    [{ "question": "statement here", "answer": "true or false" }]
    Output only the JSON object. Do not include any descriptive text, prefixes, or additional words like 'JSON' in the response. Start directly with the JSON object and ensure strict schema compliance
    the questions and answers should be the ${lang} language

    `

    const classicalQuestion = `
    TEXT: ${text}

    Generate from the previous text ${questionGroup.count} questions  that require writing meaning not a yse or no question
    Respond using Following JSON :
    [{ "question": "question text here", "answer": "write the answer here" }]
    Output only the JSON object. Do not include any descriptive text, prefixes, or additional words like 'JSON' in the response. Start directly with the JSON object and ensure strict schema compliance
    the questions and answers should be in the ${lang} language

    `

    /*     const multipleChoiceInput = `
    النص: ${text}
    قم بإنشاء ${questionGroup.count} سؤالاً من نوع اختيار من متعدد استنادًا إلى النص السابق، مع ${questionGroup.choicesCount} اختيارات لكل سؤال.
    لا تقم بتضمين ترتيب أو ترقيم في الاختيارات. على سبيل المثال، هذا التنسيق غير صحيح: "1. الخيار الأول". التنسيق الصحيح هو: "الخيار الأول".
    استجب باستخدام JSON التالي:
    [
      {
        "question": "نص السؤال هنا",
        "choices": ["مصفوفة الاختيارات"],
        "answer": "رقم الاختيار الصحيحة"
      }
    ]
`

    const trueFalseInput = `
    النص: ${text}
    قم بإنشاء ${questionGroup.count} سؤالاً من نوع صح أو خطأ استنادًا إلى النص السابق.
    اتبع هذه الإرشادات:
    1. ركز على المفاهيم الأساسية والأفكار الرئيسية في النص.
    2. صيغ الأسئلة بحيث تشبه امتحاناً حقيقياً، مع استخدام لغة واضحة ومختصرة.
    3. قم بتضمين العبارة فقط دون إضافة "صح أو خطأ" أو أي عبارة مشابهة. فقط قم بتضمين العبارة.
    استجب باستخدام JSON التالي:
    [
      {
        "question": "النص هنا",
        "answer": "صح أو خطأ"
      }
    ]
`

    const classicalQuestion = `
    النص: ${text}
    قم بإنشاء ${questionGroup.count} سؤالاً يتطلب كتابة إجابة وليس سؤالاً من نوع نعم أو لا.
    استجب باستخدام JSON التالي:
    [
      {
        "question": "نص السؤال هنا",
        "answer": "اكتب الإجابة هنا"
      }
    ]
    `
 */
    // Map question types to their respective prompts
    const typeToInput = {
      [QuestionGroupType.MULTIPLE_CHOICES]: multipleChoiceInput,
      [QuestionGroupType.TRUE_FALSE]: trueFalseInput,
      [QuestionGroupType.CLASSICAL]: classicalQuestion,
    }

    const typeToFormat = {
      [QuestionGroupType.MULTIPLE_CHOICES]: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
          },
          choices: {
            type: 'array',
            items: [
              {
                type: 'string',
              },
            ],
          },
          answer: {
            type: 'string',
          },
        },
        required: ['question', 'choices', 'answer'],
      },
      [QuestionGroupType.TRUE_FALSE]: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
          },
          answer: {
            type: 'string',
          },
        },
        required: ['question', 'answer'],
      },
      [QuestionGroupType.CLASSICAL]: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
          },
          answer: {
            type: 'string',
          },
        },
        required: ['question', 'answer'],
      },
    }

    const input: string = typeToInput[questionGroup.type]
    const format: object = typeToFormat[questionGroup.type]
    // Call the AI service to generate questions
    /*     const response = await ollama.chat({
      model: 'nezahatkorkmaz/deepseek-v3:latest',
      messages: [
        {
          role: 'user',
          content: input,
        },
      ],
      format: format,
    })
 */
    const response = await this.aiService.deepseek.chat.completions.create({
      model: 'deepseek/deepseek-r1-zero:free',
      messages: [
        {
          role: 'user',
          content: input,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          strict: true,
          schema: format as any,
          name: 'schema',
        },
      },
    })

    const promptResult = response.choices[0].message.content
    // Validate the AI response
    if (!promptResult) {
      throw new BadRequestException(
        'حدث خطأ اثناء المعالجة, أعد المحاولة مرة اخرى',
      )
    }

    // Clean up the response and return it
    return {
      result: promptResult
        .replaceAll('\\boxed', '')
        .replaceAll('\n', '')
        .replaceAll('```', '')
        .replace('json', ''),

      type: questionGroup.type,
    }
  }

  async generateExam(examDto: ExamDto, pdfs: Express.Multer.File[]) {
    // Convert PDFs to text
    const promises = pdfs.map((pdf) => pdfToText(pdf.buffer))
    const promisesResult = await Promise.all(promises)
    const totalText = promisesResult.join()

    // Generate question groups based on the extracted text
    const questionGroups = examDto.questionGroups.map((qg) => {
      try {
        const startingIndex = Math.round(
          Math.random() * (totalText.length <= 2000 ? 0 : totalText.length),
        )
        return this.generateQuestionGroup(
          qg,
          totalText.substring(startingIndex, startingIndex + 2000) ??
            totalText.substring(0, 800),
        )
      } catch (e: any) {
        console.log(e.message)
        return this.generateQuestionGroup(
          qg,
          totalText.substring(0, 800),
          examDto.lang,
        )
      }
    })

    const result = (await Promise.all(questionGroups)).map((e) => {
      try {
        return {
          questions: JSON.parse(e.result.substring(1, e.result.length - 1)),
          type: e.type,
        }
      } catch (err: any) {
        console.log(err)
        return {
          err,
          questions: e.result,
          type: e.type,
        }
      }
    })

    return {
      [QuestionGroupType.CLASSICAL]: flatten(
        result
          .filter(({ type }) => type === QuestionGroupType.CLASSICAL)
          .map(({ questions }) => questions),
      ),
      [QuestionGroupType.MULTIPLE_CHOICES]: flatten(
        result
          .filter(({ type }) => type === QuestionGroupType.MULTIPLE_CHOICES)
          .map(({ questions }) => questions),
      ),
      [QuestionGroupType.TRUE_FALSE]: flatten(
        result
          .filter(({ type }) => type === QuestionGroupType.TRUE_FALSE)
          .map(({ questions }) => questions),
      ),
    }
  }
}
