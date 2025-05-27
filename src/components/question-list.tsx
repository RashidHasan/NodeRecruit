import React from "react";
import {
  Card,
  CardBody,
  ButtonGroup,
  Button
} from "@heroui/react";
import { QuestionType, QuestionResponseType } from "../types/interview";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next'; // أضف هذا إذا كنت ستستخدم t() هنا

interface QuestionListProps {
  questions: QuestionType[];
  responses: QuestionResponseType[];
  onResponseChange: (questionId: string, answered: boolean, isCorrect?: boolean) => void;
}

export const QuestionList = ({
  questions,
  responses,
  onResponseChange
}: QuestionListProps) => {
  const { t } = useTranslation(); // إذا كنت ستستخدمه

  const getQuestionResponse = (questionId: string) => {
    const response = responses.find(r => r.questionId === questionId);
    return response || { questionId, answered: false, isCorrect: undefined };
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner level':
        return 'text-success-500';
      case 'intermediate level':
        return 'text-warning-500';
      case 'advanced level':
        return 'text-danger-500';
      default:
        return 'text-default-500';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner level':
        return 'lucide:battery-low'; // أو battery-eco
      case 'intermediate level':
        return 'lucide:battery-medium';
      case 'advanced level':
        return 'lucide:battery-full';
      default:
        return 'lucide:battery'; // أيقونة افتراضية
    }
  };

  return (
    <div className="space-y-4 py-4">
      {questions.map((question, index) => {
        const response = getQuestionResponse(question.id);

        return (
          <Card key={question.id} className="shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {index + 1}
                    </span>
                    <h4 className="font-medium text-default-800">{question.text}</h4>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <Icon
                      icon={getDifficultyIcon(question.level)}
                      className={`${getDifficultyColor(question.level)}`}
                    />
                    <span className={`${getDifficultyColor(question.level)} font-medium`}>
                      {question.level}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ButtonGroup size="sm">
                    <Button
                      color={response.answered && response.isCorrect === true ? "success" : "default"}
                      variant={(response.answered && response.isCorrect === true) ? "solid" : "bordered"}
                      onPress={() => onResponseChange(question.id, true, true)}
                      isIconOnly={!response.answered || response.isCorrect !== true}
                      startContent={<Icon icon="lucide:check" />}
                      aria-label={t('questions.correct')}
                    >
                     {(response.answered && response.isCorrect === true) && t('questions.correct')}
                    </Button>
                    <Button
                      color={response.answered && response.isCorrect === false ? "danger" : "default"}
                      variant={(response.answered && response.isCorrect === false) ? "solid" : "bordered"}
                      onPress={() => onResponseChange(question.id, true, false)}
                       isIconOnly={!response.answered || response.isCorrect !== false}
                      startContent={<Icon icon="lucide:x" />}
                      aria-label={t('questions.incorrect')}
                    >
                      {(response.answered && response.isCorrect === false) && t('questions.incorrect')}
                    </Button>
                    <Button
                      color={!response.answered ? "default" : "default"}  
                      variant={!response.answered ? "solid" : "bordered"}
                      onPress={() => onResponseChange(question.id, false, undefined)}
                      isIconOnly={response.answered}
                      startContent={<Icon icon="lucide:minus" />}
                      aria-label={t('questions.notAnswered')}
                    >
                     {!response.answered && t('questions.notAnswered')}
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};