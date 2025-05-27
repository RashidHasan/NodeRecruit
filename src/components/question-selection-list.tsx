import React from "react";
import {
  Checkbox,
  Button,
  ButtonGroup,
  Alert,
  Tooltip,
  Tabs,
  Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { QuestionType } from "../types/interview";

export interface QuestionSelectionListProps {
  categories: {
    id: string;
    name: string;
    questions: QuestionType[];
  }[];
  selectedQuestions: string[];
  onQuestionSelection: (questionId: string, isSelected: boolean) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

export const QuestionSelectionList: React.FC<QuestionSelectionListProps> = ({
  categories,
  selectedQuestions,
  onQuestionSelection,
  onDeleteQuestion,
}) => {
  const { t } = useTranslation();

   const devCategories = React.useMemo(
    () => categories.filter((c) => !c.id.startsWith("qa-")),
    [categories]
  );
  const qaCategories = React.useMemo(
    () => categories.filter((c) => c.id.startsWith("qa-")),
    [categories]
  );

  type TabKey = "dev" | "qa";
  const [activeTab, setActiveTab] = React.useState<TabKey>("dev");

  const currentCategories = activeTab === "dev" ? devCategories : qaCategories;

   const areAllSelected = (ids: string[]) =>
    ids.every((id) => selectedQuestions.includes(id));

  const handleSelectAllInCategory = (catId: string, sel: boolean) => {
    const cat = currentCategories.find((c) => c.id === catId);
    if (!cat) return;

    const ids = cat.questions.map((q) => q.id);

    if (sel) {
      ids
        .filter((id) => !selectedQuestions.includes(id))
        .forEach((id) => onQuestionSelection(id, true));
    } else {
      ids
        .filter((id) => selectedQuestions.includes(id))
        .forEach((id) => onQuestionSelection(id, false));
    }
  };

  const toggleSelectAll = () => {
    const allIds = currentCategories.flatMap((c) => c.questions.map((q) => q.id));
    const allSel = areAllSelected(allIds);

    if (allSel) {
      selectedQuestions.forEach((id) => onQuestionSelection(id, false));
    } else {
      allIds
        .filter((id) => !selectedQuestions.includes(id))
        .forEach((id) => onQuestionSelection(id, true));
    }
  };

   return (
    <div className="space-y-6">
       {selectedQuestions.length === 0 && (
        <Alert color="warning">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:alert-circle" />
            <span>{t("app.noQuestionsSelected")}</span>
          </div>
        </Alert>
      )}

       <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as TabKey)}
        color="primary"
        variant="bordered"
      >
        <Tab key="dev" title={t("questions.tab.developers")} />
        <Tab key="qa" title={t("questions.tab.qa")} />
      </Tabs>

       {currentCategories.length > 0 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={toggleSelectAll}
            startContent={<Icon icon="lucide:check-square" />}
          >
            {areAllSelected(
              currentCategories.flatMap((c) => c.questions.map((q) => q.id))
            )
              ? t("questions.unselectAll")
              : t("questions.selectAll")}
          </Button>
        </div>
      )}

       {currentCategories.map((cat) => {
        const ids = cat.questions.map((q) => q.id);
        const allSel = areAllSelected(ids);
        const someSel =
          !allSel && ids.some((id) => selectedQuestions.includes(id));

        return (
          <div
            key={cat.id}
            className="border border-default-200 rounded-lg p-4 space-y-3"
          >
             <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={allSel}
                  isIndeterminate={someSel}
                  onValueChange={(sel) => handleSelectAllInCategory(cat.id, sel)}
                  size="md"
                  color="primary"
                />
                <h4 className="text-lg font-medium">{cat.name}</h4>
              </div>
              <span className="text-sm text-default-500">
                {t("questions.selectedCount", {
                  count: ids.filter((id) => selectedQuestions.includes(id)).length,
                  total: ids.length,
                })}
              </span>
            </div>

             <div className="space-y-2">
              {cat.questions.map((q) => {
                const lvl = q.level.toLowerCase();
                const levelColor = lvl.includes("beginner")
                  ? "text-success-500"
                  : lvl.includes("intermediate")
                  ? "text-warning-500"
                  : "text-danger-500";

                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-2 p-2 hover:bg-default-50 rounded-md"
                  >
                    <Checkbox
                      isSelected={selectedQuestions.includes(q.id)}
                      onValueChange={(sel) => onQuestionSelection(q.id, sel)}
                      size="md"
                      color="primary"
                    >
                      <div className="flex flex-col">
                        <span>{q.text}</span>
                        <span className={`text-xs ${levelColor}`}>{q.level}</span>
                      </div>
                    </Checkbox>

                    {onDeleteQuestion && (
                      <Tooltip content={t("questions.delete")}>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => onDeleteQuestion(q.id)}
                        >
                          <Icon icon="lucide:trash-2" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
