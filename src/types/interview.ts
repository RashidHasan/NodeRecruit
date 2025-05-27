export interface QuestionType {
  id: string;
  text: string;
  level: string;
  category: string;
  isCustom?: boolean; // To mark questions added by the user
}

export interface QuestionCategoryType {
  id: string;
  name: string;
  questions: QuestionType[];
}

export interface QuestionResponseType {
  questionId: string;
  answered: boolean;
  isCorrect?: boolean;
}

export interface CandidateType {
  name: string;
  position: string;
  email: string;
  phone: string;
  date: string; // Should remain string as it's bound to date input
  time: string; // Should remain string as it's bound to time input
}

export interface InterviewerType {
  name: string;
  position: string;
}