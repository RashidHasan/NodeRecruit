import React from "react";
import { Checkbox, Button, Alert } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { QuestionType } from "../types/interview";

interface QuestionSelectionListProps {
  categories: {
    id: string;
    name: string;
    questions: QuestionType[];
  }[];
  selectedQuestions: string[];
  onQuestionSelection: (questionId: string, isSelected: boolean) => void;
}

export const QuestionSelectionList: React.FC<QuestionSelectionListProps> = ({
  categories,
  selectedQuestions,
  onQuestionSelection
}) => {
  const { t } = useTranslation();

  /* تحديد أو إلغاء تحديد كل أسئلة فئة */
  const handleSelectAllInCategory = (categoryId: string, isSelected: boolean) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    category.questions.forEach(q => {
      const alreadySelected = selectedQuestions.includes(q.id);
      if (isSelected !== alreadySelected) {
        onQuestionSelection(q.id, isSelected);
      }
    });
  };

  /* زر تحديد/إلغاء تحديد كل أسئلة كل الفئات */
  const toggleSelectAll = () => {
    const allQuestions = categories.flatMap(c => c.questions);
    const allSelected = selectedQuestions.length === allQuestions.length;

    allQuestions.forEach(q => {
      const alreadySelected = selectedQuestions.includes(q.id);
      const shouldBeSelected = !allSelected;
      if (shouldBeSelected !== alreadySelected) {
        onQuestionSelection(q.id, shouldBeSelected);
      }
    });
  };

  return (
    <div className="space-y-6">
      {selectedQuestions.length === 0 && (
        <Alert color="warning" className="mb-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:alert-circle" className="text-lg" />
            <span>{t("app.noQuestionsSelected")}</span>
          </div>
        </Alert>
      )}

      {/* زر تحديد الكل / إلغاء التحديد */}
      {categories.length > 0 && (
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={toggleSelectAll}
            startContent={<Icon icon="lucide:check-square" />}
          >
            {selectedQuestions.length === categories.flatMap(c => c.questions).length
              ? t("questions.unselectAll")
              : t("questions.selectAll")}
          </Button>
        </div>
      )}

      {/* قائمة الفئات */}
      {categories.map(category => {
        const selectedInCategory = category.questions.filter(q =>
          selectedQuestions.includes(q.id)
        ).length;
        const allSelected = selectedInCategory === category.questions.length && category.questions.length > 0;
        const someSelected = selectedInCategory > 0 && !allSelected;

        return (
          <div key={category.id} className="border border-default-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={allSelected}
                  isIndeterminate={someSelected}
                  onValueChange={sel => handleSelectAllInCategory(category.id, sel)}
                  size="md"
                  color="primary"
                  aria-label={`Select all questions in ${category.name}`}
                />
                <h4 className="text-lg font-medium">{category.name}</h4>
              </div>
              <span className="text-sm text-default-500">
                {t("questions.selectedCount", {
                  count: selectedInCategory,
                  total: category.questions.length
                })}
              </span>
            </div>

            <div className="space-y-2">
              {category.questions.map(question => (
                <div key={question.id} className="flex items-center gap-2 p-2 hover:bg-default-50 rounded-md">
                  <Checkbox
                    isSelected={selectedQuestions.includes(question.id)}
                    onValueChange={sel => onQuestionSelection(question.id, sel)}
                    size="md"
                    color="primary"
                  >
                    <div className="flex flex-col">
                      <span>{question.text}</span>
                      <span
                        className={`text-xs ${
                          question.level.toLowerCase().includes("beginner")
                            ? "text-success-500"
                            : question.level.toLowerCase().includes("intermediate")
                            ? "text-warning-500"
                            : "text-danger-500"
                        }`}
                      >
                        {question.level}
                      </span>
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
