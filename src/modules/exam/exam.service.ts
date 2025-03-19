import { BadRequestException, Injectable } from '@nestjs/common'
import { AIService } from '../ai/ai.service'
import { ExamDto } from './dto/generate.dto'
import {
  QuestionGroup,
  QuestionGroupType,
} from './entity/question-group.entity'
import { pdfToText } from 'pdf-ts'

@Injectable()
export class ExamService {
  constructor(private readonly aiService: AIService) {}

  async generateQuestionGroup(questionGroup: QuestionGroup, text: string) {
    // Define the prompt templates for each question type
    const multipleChoiceInput = `
    TEXT: ${text}

    Generate from the previous text ${questionGroup.count} multiple-choice questions with ${questionGroup.choicesCount} choices for each question. Follow these guidelines:
    1. Focus on the core concepts and main ideas of the text.
    2. Ensure the choices for each question are closely related and plausible, making the exam challenging and thought-provoking.
    3. Structure the questions to resemble a real exam, with clear and concise wording.
    4. Do not include ordering or numbering in the choices. For example, this format is incorrect: "1. first choice". The correct format is: "first choice".
    5. Provide the questions and answers in the following JSON structure as an array:
       [{ "question": "question text here", "choices": ["choices here"], "answer": "correct choice" }]
    6. Do not include anything other than the specified JSON structure.
    `

    const trueFalseInput = `
    TEXT: ${text}

    Generate from the previous text ${questionGroup.count} true/false questions. Follow these guidelines:
    1. Focus on the core concepts and main ideas of the text.
    2. Structure the questions to resemble a real exam, with clear and concise wording.
    3. Provide only the statement itself without adding "true or false" or any similar phrase. Only include the statement.
    4. Provide the questions and answers in the following JSON structure as an array:
    [{ "question": "statement here", "answer": "true or false" }]
    5. Do not include anything other than the specified JSON structure.
    `

    const classicalQuestion = `
    TEXT: ${text}

    Generate from the previous text ${questionGroup.count} open-ended questions (requiring a written answer, not choices or yes/no). Follow these guidelines:
    1. Focus on the core concepts and main ideas of the text.
    2. Structure the questions to resemble a real exam, with clear and concise wording.
    3. Provide the questions and answers in the following JSON structure as an array:
       [{ "question": "question text here", "answer": "answer text here" }]
    4. Do not include anything other than the specified JSON structure.
    `

    // Map question types to their respective prompts
    const typeToInput = {
      [QuestionGroupType.MULTIPLE_CHOICES]: multipleChoiceInput,
      [QuestionGroupType.TRUE_FALSE]: trueFalseInput,
      [QuestionGroupType.CLASSICAL]: classicalQuestion,
    }

    const input: string = typeToInput[questionGroup.type]

    // Call the AI service to generate questions
    const response = await this.aiService.deepseek.chat.completions.create({
      model: 'deepseek/deepseek-r1-zero:free',
      messages: [
        {
          role: 'user',
          content: input,
        },
      ],
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
        .replaceAll('```json', ''),
      type: questionGroup.type,
    }
  }

  async generateExam(examDto: ExamDto, pdfs: Express.Multer.File[]) {
    // Convert PDFs to text
    const promises = pdfs.map((pdf) => pdfToText(pdf.buffer))
    const promisesResult = await Promise.all(promises)
    const totalText = promisesResult.join()

    // Generate question groups based on the extracted text
    const questionGroups = examDto.questionGroups.map((qg, i) =>
      this.generateQuestionGroup(qg, totalText.substring(i, i + 800)),
    )

    const result = (await Promise.all(questionGroups)).map((e) => {
      try {
        return {
          questions: JSON.parse(e.result.substring(1, e.result.length - 1)),
          type: e.type,
        }
      } catch (e: any) {
        return {
          err: e,
          questions: JSON.parse(e.result.substring(1, e.result.length - 1)),
          type: e.type,
        }
      }
    })

    return {
      [QuestionGroupType.CLASSICAL]: result
        .filter(({ type }) => type === QuestionGroupType.CLASSICAL)
        .map(({ questions }) => questions),
      [QuestionGroupType.MULTIPLE_CHOICES]: result
        .filter(({ type }) => type === QuestionGroupType.MULTIPLE_CHOICES)
        .map(({ questions }) => questions),
      [QuestionGroupType.TRUE_FALSE]: result
        .filter(({ type }) => type === QuestionGroupType.TRUE_FALSE)
        .map(({ questions }) => questions),
    }
  }
}
