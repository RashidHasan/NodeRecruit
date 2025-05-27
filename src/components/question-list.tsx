import React from "react";
import {
  Card,
  CardBody,
  ButtonGroup,
  Button,
  Tooltip,
  Chip,
} from "@heroui/react";
import { QuestionType, QuestionResponseType } from "../types/interview";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

/* -------------------------------------------------- */
/*                     QuestionList                   */
/* -------------------------------------------------- */
export interface QuestionListProps {
  questions: QuestionType[];
  responses: QuestionResponseType[];
  onResponseChange: (
    id: string,
    answered: boolean,
    isCorrect?: boolean
  ) => void;
  /** يُمرَّر في خطوة الاختبار فقط لعرض زرّ الحذف */
  onDelete?: (id: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  responses,
  onResponseChange,
  onDelete,
}) => {
  const { t } = useTranslation();

  /* ---------- helpers ---------- */
  const getResp = (id: string) =>
    responses.find((r) => r.questionId === id) ?? {
      questionId: id,
      answered: false,
      isCorrect: undefined,
    };

  const levelMeta = (lvl: string) => {
    switch (lvl.toLowerCase()) {
      case "beginner level":
        return {
          color: "success",
          icon: "lucide:battery-low",
          text: t("questions.level.beginner"),
        };
      case "intermediate level":
        return {
          color: "warning",
          icon: "lucide:battery-medium",
          text: t("questions.level.intermediate"),
        };
      case "advanced level":
        return {
          color: "danger",
          icon: "lucide:battery-full",
          text: t("questions.level.advanced"),
        };
      default:
        return { color: "default", icon: "lucide:battery", text: lvl };
    }
  };

  /* ---------- JSX ---------- */
  return (
    <div className="space-y-5 pt-4">
      {questions.map((q, idx) => {
        const resp = getResp(q.id);
        const { color, icon, text } = levelMeta(q.level);

        const border = !resp.answered
          ? "border-default-200"
          : resp.isCorrect
          ? "border-success-500"
          : "border-danger-500";

        return (
          <Card
            key={q.id}
            className={`relative border-l-4 ${border} shadow-sm transition-colors`}
          >
            <CardBody className="p-5">
              {/* العنوان وحالة المستوى */}
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {idx + 1}
                </span>

                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-default-900">{q.text}</h4>
                  <div className="flex items-center gap-1 text-xs">
                    <Icon icon={icon} className={`text-${color}-500`} />
                    <span className={`text-${color}-600 font-semibold`}>
                      {text}
                    </span>
                  </div>
                </div>

                {/* شارة إجابة صحيحة/خطأ */}
                {resp.answered && (
                  <Chip
                    size="sm"
                    color={resp.isCorrect ? "success" : "danger"}
                    variant="flat"
                  >
                    {resp.isCorrect
                      ? t("questions.correct")
                      : t("questions.incorrect")}
                  </Chip>
                )}

                {/* زر حذف السؤال (يظهر عند تمرير onDelete) */}
                {onDelete && (
                  <Tooltip content={t("questions.delete")}>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => onDelete(q.id)}
                    >
                      <Icon icon="lucide:trash-2" />
                    </Button>
                  </Tooltip>
                )}
              </div>

              {/* أزرار التقييم */}
              <div className="mt-4 flex justify-end">
                <ButtonGroup size="sm" className="gap-2">
                  <Tooltip content={t("questions.correct")}>
                    <Button
                      isIconOnly
                      color={resp.isCorrect ? "success" : "default"}
                      variant={resp.isCorrect ? "solid" : "bordered"}
                      onPress={() => onResponseChange(q.id, true, true)}
                      aria-label={t("questions.correct")}
                    >
                      <Icon icon="lucide:check" />
                    </Button>
                  </Tooltip>

                  <Tooltip content={t("questions.incorrect")}>
                    <Button
                      isIconOnly
                      color={
                        resp.answered && resp.isCorrect === false
                          ? "danger"
                          : "default"
                      }
                      variant={
                        resp.answered && resp.isCorrect === false
                          ? "solid"
                          : "bordered"
                      }
                      onPress={() => onResponseChange(q.id, true, false)}
                      aria-label={t("questions.incorrect")}
                    >
                      <Icon icon="lucide:x" />
                    </Button>
                  </Tooltip>

                  <Tooltip content={t("questions.notAnswered")}>
                    <Button
                      isIconOnly
                      color={!resp.answered ? "warning" : "default"}
                      variant={!resp.answered ? "solid" : "bordered"}
                      onPress={() => onResponseChange(q.id, false, undefined)}
                      aria-label={t("questions.notAnswered")}
                    >
                      <Icon icon="lucide:minus" />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};
