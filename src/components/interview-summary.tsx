import React from "react";
import { Card, CardBody, Button, Divider, Progress } from "@heroui/react";
import {
  CandidateType,
  InterviewerType,
  QuestionResponseType,
} from "../types/interview";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { questionCategories } from "../data/questions";

interface InterviewSummaryProps {
  candidate: CandidateType;
  interviewer: InterviewerType;
  responses: QuestionResponseType[];
  totalQuestions: number;
  onBack: () => void;
  onExportPDF: () => void;
  categories: typeof questionCategories;
  candidateImage: string | null;
  isPdfExporting: boolean;
}

export const InterviewSummary = React.forwardRef<
  HTMLDivElement,
  InterviewSummaryProps
>(
  (
    {
      candidate,
      interviewer,
      responses,
      totalQuestions,
      onBack,
      onExportPDF,
      categories,
      candidateImage,
      isPdfExporting,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const selectedIds = React.useMemo(
      () => categories.flatMap((c) => c.questions.map((q) => q.id)),
      [categories]
    );

    const answeredCount = responses.filter(
      (r) => r.answered && selectedIds.includes(r.questionId)
    ).length;

    const correctAnswers = responses.filter(
      (r) => r.answered && r.isCorrect && selectedIds.includes(r.questionId)
    ).length;

    const incorrectAnswers = answeredCount - correctAnswers;
    const score = answeredCount
      ? Math.round((correctAnswers / answeredCount) * 100)
      : 0;

    const getScoreColor = (s: number): "success" | "warning" | "danger" =>
      s >= 80 ? "success" : s >= 60 ? "warning" : "danger";

    const statusLabel = (resp?: QuestionResponseType) => {
      if (!resp || !resp.answered)
        return { text: t("summary.notAnswered"), cls: "text-danger-600" };
      return resp.isCorrect
        ? { text: t("summary.correct"), cls: "text-success-600" }
        : { text: t("summary.incorrect"), cls: "text-danger-600" };
    };

    return (
      <Card
        className={`shadow-lg rounded-xl ${
          isPdfExporting ? "pdf-export-bg" : "bg-slate-50"
        }`}
      >
        <CardBody
          className={`p-6 md:p-8 ${isPdfExporting ? "pdf-export-mode" : ""}`}
        >
          <div ref={ref}>
            {}
            {!isPdfExporting ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200">
                <h1 className="text-3xl font-bold text-slate-800 mb-4 sm:mb-0">
                  {t("summary.title")}
                </h1>

                <div className="flex gap-3">
                  <Button
                    variant="light"
                    className="text-slate-700 hover:bg-slate-200"
                    startContent={<Icon icon="lucide:arrow-left" />}
                    onPress={onBack}
                  >
                    {t("summary.backToForm")}
                  </Button>

                  <Button
                    color="primary"
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    startContent={<Icon icon="lucide:download" />}
                    onPress={onExportPDF}
                  >
                    {t("summary.exportPDF")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center mb-10">
                <Icon
                  icon="lucide:file-check-2"
                  className="text-primary-600 text-5xl mx-auto mb-3"
                />
                <h1 className="text-3xl font-bold text-primary-700">
                  {t("summary.title")}
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  <span>
                    {t("summary.reportDate")}: {new Date().toLocaleDateString()}
                  </span>{" "}
                  |{" "}
                  <span>
                    {t("summary.candidateName")}: {candidate.name}
                  </span>
                </p>
              </div>
            )}

            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
              {}
              <div className="lg:col-span-1 flex flex-col items-center text-center lg:text-left lg:items-start">
                <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center mb-5 border-4 border-white shadow-md">
                  {candidateImage ? (
                    <img
                      src={candidateImage}
                      alt={t("candidate.photo")}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Icon
                      icon="lucide:user-round"
                      className="w-1/2 h-1/2 text-slate-400"
                    />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">
                  {candidate.name}
                </h2>
                <p className="text-primary-600 font-medium text-md">
                  {candidate.position || t("summary.notSpecified")}
                </p>
                {isPdfExporting && (
                  <p className="text-xs text-slate-500 mt-1">
                    {t("candidate.photo")}
                  </p>
                )}
              </div>

              {}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <Card className="shadow-lg rounded-lg bg-white">
                  <CardBody className="p-5">
                    <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center gap-2">
                      <Icon icon="lucide:user-circle-2" className="w-6 h-6" />
                      {t("summary.candidateInfo")}
                    </h3>
                    <div className="space-y-2.5 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">
                          {t("summary.email")}:
                        </span>{" "}
                        {candidate.email || t("summary.notSpecified")}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {t("summary.phone")}:
                        </span>{" "}
                        {candidate.phone || t("summary.notSpecified")}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {t("summary.date")}:
                        </span>{" "}
                        {candidate.date}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {t("summary.time")}:
                        </span>{" "}
                        {candidate.time || t("summary.notSpecified")}
                      </p>
                    </div>
                  </CardBody>
                </Card>

                {}
                <Card className="shadow-lg rounded-lg bg-white">
                  <CardBody className="p-5">
                    <h3 className="text-lg font-semibold text-primary-700 mb-4 flex items-center gap-2">
                      <Icon icon="lucide:clipboard-check" className="w-6 h-6" />
                      {t("summary.interviewerInfo")}
                    </h3>
                    <div className="space-y-2.5 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">
                          {t("summary.name")}:
                        </span>{" "}
                        {interviewer.name}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {t("summary.position")}:
                        </span>{" "}
                        {interviewer.position || t("summary.notSpecified")}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {}
            <Card className="shadow-xl rounded-lg mb-8 bg-white">
              <CardBody className="p-5 md:p-6">
                <h3 className="text-xl font-semibold text-primary-700 mb-5 flex items-center gap-2">
                  <Icon icon="lucide:bar-chart-big" className="w-7 h-7" />
                  {t("summary.overallResults")}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <StatBox
                    label={t("summary.questionsAnswered")}
                    value={`${answeredCount}/${totalQuestions}`}
                    color="primary"
                  />
                  <StatBox
                    label={t("summary.correctAnswers")}
                    value={correctAnswers}
                    color="success"
                  />
                  <StatBox
                    label={t("summary.incorrectAnswers")}
                    value={incorrectAnswers}
                    color="danger"
                  />
                  <StatBox
                    label={t("summary.score")}
                    value={`${score}%`}
                    color={getScoreColor(score)}
                  />
                </div>

                <div className="mt-6">
                  <p className="font-semibold text-slate-700 mb-2">
                    {t("summary.performanceOverview")}:
                  </p>
                  <Progress
                    value={score}
                    color={getScoreColor(score)}
                    className="h-3 rounded-full"
                    aria-label={`${t("summary.scoreAria")}: ${score}%`}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Divider className="my-8 border-slate-300" />

            {}
            <h3 className="text-xl font-semibold text-primary-700 mb-6 flex items-center gap-2">
              <Icon icon="lucide:layout-list" className="w-7 h-7" />
              {t("summary.categoriesBreakdown")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const responseMap: Record<string, QuestionResponseType> = {};
                responses.forEach((r) => (responseMap[r.questionId] = r));

                const answeredQs = cat.questions.filter(
                  (q) => responseMap[q.id]?.answered
                );
                if (answeredQs.length === 0) return null;

                const categoryCorrect = answeredQs.filter(
                  (q) => responseMap[q.id].isCorrect
                ).length;
                const categoryScore = Math.round(
                  (categoryCorrect / answeredQs.length) * 100
                );
                const categoryScoreColor = getScoreColor(categoryScore);

                return (
                  <Card
                    key={cat.id}
                    className="shadow-lg rounded-lg bg-white overflow-hidden"
                  >
                    <CardBody className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-slate-800">
                          {cat.name}
                        </h4>
                        <span
                          className={`text-sm px-3 py-1 rounded-full font-bold bg-${categoryScoreColor}-100 text-${categoryScoreColor}-700`}
                        >
                          {categoryScore}%
                        </span>
                      </div>

                      <Progress
                        value={categoryScore}
                        color={categoryScoreColor}
                        className="h-2.5 rounded-full mb-4"
                        aria-label={`${cat.name} ${t(
                          "summary.scoreAria"
                        )}: ${categoryScore}%`}
                      />

                      <h5 className="text-sm font-semibold text-slate-700 mb-2 mt-4 flex items-center gap-1.5">
                        <Icon
                          icon="lucide:list-checks"
                          className="w-5 h-5 text-primary-600"
                        />
                        {t("summary.questionsList")} ({answeredQs.length})
                      </h5>

                      <ul className="space-y-1.5 text-sm list-none pl-1">
                        {answeredQs.map((q, index) => {
                          const lbl = statusLabel(responseMap[q.id]);
                          return (
                            <li
                              key={q.id}
                              className="flex justify-between items-center py-1 border-b border-slate-100 last:border-b-0"
                            >
                              <span className="text-slate-700 mr-2">
                                <span className="text-slate-500">
                                  {index + 1}.{" "}
                                </span>{" "}
                                {q.text}
                              </span>
                              <span
                                className={`${
                                  lbl.cls
                                } font-semibold text-xs px-2 py-0.5 rounded-md ${
                                  lbl.text === t("summary.correct")
                                    ? "bg-success-50"
                                    : "bg-danger-50"
                                }`}
                              >
                                {lbl.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {}
            {isPdfExporting && (
              <div className="text-center text-xs text-slate-500 mt-12 pt-6 border-t border-slate-300">
                <p>
                  &copy; {new Date().getFullYear()} MZN - Multi Zillion Nodes.{" "}
                  {t("summary.allRightsReserved")}
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }
);

InterviewSummary.displayName = "InterviewSummary";

interface StatBoxProps {
  label: string;
  value: React.ReactNode;
  color: string;
}
const StatBox = ({ label, value, color }: StatBoxProps) => (
  <div className={`text-center p-3 rounded-md bg-${color}-50`}>
    <p className={`text-sm font-medium text-${color}-700`}>{label}</p>
    <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
  </div>
);
