import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { TextGenerationOutput } from '@huggingface/inference'
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
    const multipleChoiceInput = `
    TEXT : ${text}
    Generate From the Previous ${questionGroup.count} multiple-choice questions with ${questionGroup.choicesCount} choices for each question:
    1. Focus on the core concepts and main ideas of the text.
    2. Ensure the choices for each question are closely related and plausible, making the exam challenging and thought-provoking.
    3. Structure the questions to resemble a real exam, with clear and concise wording.
    4. Do not include ordering or numbering in the choices. For example, this format is incorrect: "1. first choice". The correct format is: "first choice".
    
    Provide the questions and answers in the following JSON structure as an array:
    [{ "question": "question text here", "choices": ["choices here"], "answer": "answer" }]
    Do not include anything other than the specified JSON structure.
  `

    const trueFalseInput = `
    TEXT : ${text}
    Generate From the Previous ${questionGroup.count} true/false questions:
    1. Focus on the core concepts and main ideas of the text.
    2. Structure the questions to resemble a real exam, with clear and concise wording.
    3. Provide only the statement itself without adding "true or false" or any similar phrase. Only include the statement.
  
    Provide the questions and answers in the following JSON structure as an array:
    [{ "question": "question text here", "answer": "answer either true or false" }]
    Do not include anything other than the specified JSON structure.
  `

    const classicalQuestion = `
    TEXT : ${text}
    Generate From the Previous ${questionGroup.count} open-ended questions (requiring a written answer, not choices or yes/no):
    1. Focus on the core concepts and main ideas of the text.
    2. Structure the questions to resemble a real exam, with clear and concise wording.
  
    Provide the questions and answers in the following JSON structure as an array:
    [{ "question": "question text here", "answer": "answer" }]
    Do not include anything other than the specified JSON structure.
  `

    const typeToInput = {
      [QuestionGroupType.MULTIPLE_CHOICES]: multipleChoiceInput,
      [QuestionGroupType.TRUE_FALSE]: trueFalseInput,
      [QuestionGroupType.CLASSICAL]: classicalQuestion,
    }

    const input: string = typeToInput[questionGroup.type]
    if (input) {
      /*
      const response = await ollama.chat({
        model: 'gemma3:1b',
        messages: [
          {
            role: 'user',
            content: input,
          },
        ],
      });
      return response.message.content
        .replaceAll('\n', '')
        .match(/json.*?```/)?.[0]
        .replaceAll('`', '')
        .substring(4);
        */
      let response: TextGenerationOutput = { generated_text: '' }
      try {
        response = await this.aiService.hf.textGeneration({
          modle: 'google/gemma-3-27b-it',
          inputs: input,
        })

        return response.generated_text
          .replaceAll('\n', '')
          .match(/(json|javascript).*?```/)?.[0]
          .replaceAll('`', '')
          .replaceAll('json', '')
          .replaceAll('javascript', '')
          .replaceAll('        ', '')
          .replaceAll('     ', '')
          .trim()
      } catch (e: any) {
        console.log(e)
      }
    } else {
      throw new InternalServerErrorException()
    }
  }

  async generateExam(examDto: ExamDto, pdfs: Express.Multer.File[]) {
    const promises = pdfs.map((pdf) => pdfToText(pdf.buffer))

    const promisesResult = await Promise.all(promises)
    const totalText = promisesResult.join()
    const questionGroups = examDto.questionGroups.map((qg) =>
      this.generateQuestionGroup(qg, totalText),
    )
    const result = (await Promise.all(questionGroups)).map((e) => {
      try {
        if (typeof e == 'string') {
          const parsedJson = JSON.parse(e) as object
          return parsedJson
        } else return {}
      } catch (err: any) {
        try {
          if (err.message.includes('white')) {
            const parsedJson = (JSON.parse(`[${e}]`) as object) ?? {}
            return parsedJson
          } else return { err: err?.message, message: e }
        } catch (err: any) {
          return { err: err?.message, message: e }
        }
      }
    })
    if (result) return result
    else throw new InternalServerErrorException()
  }
}
