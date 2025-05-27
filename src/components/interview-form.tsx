import React from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  Textarea
} from "@heroui/react";

import { QuestionList } from "./question-list";
import { QuestionSelectionList } from "./question-selection-list"; // ✅ النسخة المحدثة
import { questionCategories } from "../data/questions";
import { CandidateInfo } from "./candidate-info";
import {
  CandidateType,
  QuestionResponseType,
  QuestionType,
  InterviewerType
} from "../types/interview";

import { InterviewSummary } from "./interview-summary";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

/* -------------------------------------------------------------------- */
/*                          InterviewForm Component                      */
/* -------------------------------------------------------------------- */
export const InterviewForm: React.FC = () => {
  const { t } = useTranslation();

  /* ---------- الحالة ---------- */
  const [candidate, setCandidate] = React.useState<CandidateType>({
    name: "",
    position: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  });

  const [interviewer, setInterviewer] = React.useState<InterviewerType>({
    name: "",
    position: ""
  });

  const [responses, setResponses] = React.useState<QuestionResponseType[]>([]);
  const [showSummary, setShowSummary] = React.useState(false);
  const [selectedQuestions, setSelectedQuestions] = React.useState<string[]>([]);
  const [candidateImage, setCandidateImage] = React.useState<string | null>(null);
  const [formStep, setFormStep] = React.useState<"info" | "questions" | "test">("info");
  const [isPdfExporting, setIsPdfExporting] = React.useState(false);

  /* ----------- نوافذ منبثقة (إضافة سؤال / فئة) ---------- */
  const [showAddQuestionModal, setShowAddQuestionModal] = React.useState(false);
  const [newQuestion, setNewQuestion] = React.useState({
    text: "",
    level: "Beginner level",
    category: ""
  });

  const [showAddCategoryModal, setShowAddCategoryModal] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({ name: "", id: "" });

  /* مرجع للتصدير إلى PDF */
  const summaryRef = React.useRef<HTMLDivElement>(null);

  /* ---------- Handlers أساسية ---------- */
  const handleCandidateChange = (field: keyof CandidateType, v: string) =>
    setCandidate(prev => ({ ...prev, [field]: v }));

  const handleInterviewerChange = (field: keyof InterviewerType, v: string) =>
    setInterviewer(prev => ({ ...prev, [field]: v }));

  const handleResponseChange = (
    id: string,
    answered: boolean,
    isCorrect?: boolean
  ) =>
    setResponses(prev => {
      const idx = prev.findIndex(r => r.questionId === id);
      const item = { questionId: id, answered, isCorrect: answered ? isCorrect : undefined };
      return idx >= 0 ? prev.map((r, i) => (i === idx ? item : r)) : [...prev, item];
    });

  const handleQuestionSelection = (id: string, sel: boolean) =>
    setSelectedQuestions(prev => (sel ? [...prev, id] : prev.filter(x => x !== id)));

  /* ---------- خطوات النموذج ---------- */
  const validateInfoForm = () =>
    candidate.name.trim() !== "" && interviewer.name.trim() !== "";

  const handleInfoSubmit = () => validateInfoForm() && setFormStep("questions");

  const handleStartCustomTest = () =>
    selectedQuestions.length > 0 && setFormStep("test");

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummary(true);
  };

  /* ---------- تصدير PDF ---------- */
  const handleExportPDF = async () => {
    if (!summaryRef.current) return;
    setIsPdfExporting(true);
    // انتظر لحظيًا حتى يطبَّق نمط التصدير
    await new Promise(r => setTimeout(r, 100));

    const { jsPDF } = await import("jspdf");
    const html2canvas = await import("html2canvas");

    const canvas = await html2canvas.default(summaryRef.current, { scale: 2 });
    const pdf = new jsPDF("p", "mm", "a4");
    const ratio = Math.min(
      pdf.internal.pageSize.getWidth() / canvas.width,
      pdf.internal.pageSize.getHeight() / canvas.height
    );
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      canvas.width * ratio,
      canvas.height * ratio
    );
    pdf.save(
      candidate.name
        ? `${candidate.name.replace(/\s+/g, "_")}_interview_results.pdf`
        : "interview_results.pdf"
    );
    setIsPdfExporting(false);
  };

  /* ---------- إضافة سؤال وفئة ---------- */
  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.category) return;
    const id = `custom-${Date.now()}`;
    const q: QuestionType = { id, ...newQuestion };
    const idx = questionCategories.findIndex(c => c.id === q.category);
    if (idx >= 0) questionCategories[idx].questions.push(q);
    setSelectedQuestions(prev => [...prev, id]);
    setNewQuestion({ text: "", level: "Beginner level", category: "" });
    setShowAddQuestionModal(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.id) return;
    questionCategories.push({ ...newCategory, questions: [] });
    setNewCategory({ name: "", id: "" });
    setShowAddCategoryModal(false);
  };

  /* ---------- رفع صورة ---------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCandidateImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* ---------- تصفية الفئات حسب الأسئلة المختارة ---------- */
  const filteredCategories = React.useMemo(() => {
    if (formStep !== "test") return questionCategories;
    return questionCategories
      .map(c => ({
        ...c,
        questions: c.questions.filter(q => selectedQuestions.includes(q.id))
      }))
      .filter(c => c.questions.length);
  }, [formStep, selectedQuestions]);

  const totalFilteredQuestions = filteredCategories.reduce(
    (sum, c) => sum + c.questions.length,
    0
  );
  const answeredQuestions = responses.filter(r => r.answered).length;

  /* ------------------------------------------------------------------ */
  /*                             JSX                                    */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-4xl mx-auto">
      {/* -------------------- ملخص النتائج -------------------- */}
      {showSummary ? (
        <InterviewSummary
          ref={summaryRef}
          candidate={candidate}
          interviewer={interviewer}
          responses={responses}
          totalQuestions={totalFilteredQuestions}
          onBack={() => setShowSummary(false)}
          onExportPDF={handleExportPDF}
          categories={filteredCategories}
          candidateImage={candidateImage}
          isPdfExporting={isPdfExporting}
        />
      ) : (
        /* -------------------- نموذج المقابلة -------------------- */
        <Card className="shadow-md">
          <CardBody className="p-6">
            {/* رأس الصفحة */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("app.title")}</h2>

              {/* أزرار خطوة اختيار الأسئلة */}
              {formStep === "questions" && (
                <div className="flex gap-2">
                  <Button
                    color="success"
                    onPress={handleStartCustomTest}
                    isDisabled={selectedQuestions.length === 0}
                    startContent={<Icon icon="lucide:play" />}
                  >
                    {t("app.startTest")} ({selectedQuestions.length}{" "}
                    {t("questions.selected")})
                  </Button>

                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="lucide:plus" />}
                    onPress={() => setShowAddQuestionModal(true)}
                  >
                    {t("app.addQuestion")}
                  </Button>

                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="lucide:folder-plus" />}
                    onPress={() => setShowAddCategoryModal(true)}
                  >
                    {t("app.addCategory")}
                  </Button>

                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => setFormStep("info")}
                  >
                    {t("app.back")}
                  </Button>
                </div>
              )}

              {/* زر العودة من الاختبار إلى الأسئلة */}
              {formStep === "test" && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="lucide:arrow-left" />}
                  onPress={() => setFormStep("questions")}
                >
                  {t("app.backToQuestions")}
                </Button>
              )}
            </div>

            {/* -------------------- خطوة معلومات المرشح -------------------- */}
            {formStep === "info" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* معلومات المرشح والمقيِّم */}
                  <div className="md:col-span-2">
                    <CandidateInfo
                      candidate={candidate}
                      interviewer={interviewer}
                      onChange={handleCandidateChange}
                      onInterviewerChange={handleInterviewerChange}
                    />
                  </div>

                  {/* صورة المرشح */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full aspect-square bg-default-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {candidateImage ? (
                        <img
                          src={candidateImage}
                          alt={t("candidate.photo")}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <Icon
                          icon="lucide:user"
                          className="w-1/3 h-1/3 text-default-300"
                        />
                      )}
                    </div>

                    {/* رفع / حذف الصورة */}
                    <label className="w-full">
                      <Button
                        fullWidth
                        variant="flat"
                        color="primary"
                        startContent={<Icon icon="lucide:upload" />}
                        as="span"
                      >
                        {t("candidate.uploadPhoto")}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    {candidateImage && (
                      <Button
                        fullWidth
                        variant="flat"
                        color="danger"
                        startContent={<Icon icon="lucide:trash-2" />}
                        onPress={() => setCandidateImage(null)}
                      >
                        {t("candidate.removePhoto")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* أزرار الاستمرار */}
                <div className="mt-8 flex flex-col gap-4">
                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      onPress={handleInfoSubmit}
                      isDisabled={!validateInfoForm()}
                    >
                      {t("app.continue")}
                    </Button>
                  </div>

                  {!validateInfoForm() && (
                    <Alert color="warning">{t("app.enterRequiredInfo")}</Alert>
                  )}
                </div>
              </>
            )}

            {/* -------------------- خطوة اختيار الأسئلة -------------------- */}
            {formStep === "questions" && (
              <QuestionSelectionList
                categories={questionCategories}
                selectedQuestions={selectedQuestions}
                onQuestionSelection={handleQuestionSelection}
              />
            )}

            {/* -------------------- خطوة الاختبار الفعلي -------------------- */}
            {formStep === "test" && (
              <form onSubmit={handleSubmitTest}>
                <h3 className="text-xl font-semibold mb-4">
                  {t("questions.title")}
                </h3>

                {/* تبويبات الفئات */}
                <Tabs
                  aria-label="Question Categories"
                  color="primary"
                  variant="underlined"
                  classNames={{ tabList: "gap-6", tab: "max-w-fit px-0 h-12" }}
                >
                  {filteredCategories.map(c => (
                    <Tab
                      key={c.id}
                      title={
                        <div className="flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                            {c.questions.length}
                          </span>
                        </div>
                      }
                    >
                      <QuestionList
                        questions={c.questions}
                        responses={responses}
                        onResponseChange={handleResponseChange}
                      />
                    </Tab>
                  ))}
                </Tabs>

                {/* شريط التقدّم وإرسال */}
                <div className="mt-8 flex items-center justify-between">
                  <div>
                    <p className="text-default-600">
                      {t("questions.answered")}:{" "}
                      <span className="font-semibold">
                        {answeredQuestions}/{totalFilteredQuestions}
                      </span>
                    </p>
                    <div className="w-64 h-2 bg-default-100 rounded-full mt-2">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            (answeredQuestions / totalFilteredQuestions) * 100 || 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                  <Button color="primary" type="submit">
                    {t("app.submit")}
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      )}

      {/* -------------------- نافذة إضافة سؤال -------------------- */}
      <Modal
        isOpen={showAddQuestionModal}
        onOpenChange={setShowAddQuestionModal}
        placement="center"
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>{t("addQuestion.title")}</ModalHeader>
              <ModalBody>
                <Textarea
                  label={t("addQuestion.text")}
                  placeholder={t("addQuestion.textPlaceholder")}
                  value={newQuestion.text}
                  onValueChange={v => setNewQuestion(prev => ({ ...prev, text: v }))}
                  minRows={3}
                  isRequired
                />

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newQuestion.level}
                    onChange={e => setNewQuestion(prev => ({ ...prev, level: e.target.value }))}
                  >
                    <option value="Beginner level">
                      {t("addQuestion.level.beginner")}
                    </option>
                    <option value="Intermediate Level">
                      {t("addQuestion.level.intermediate")}
                    </option>
                    <option value="Advanced Level">
                      {t("addQuestion.level.advanced")}
                    </option>
                  </select>

                  <select
                    className="w-full p-2 border rounded-md"
                    value={newQuestion.category}
                    onChange={e => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">{t("addQuestion.category")}</option>
                    {questionCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  {t("app.cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddQuestion}
                  isDisabled={!newQuestion.text || !newQuestion.category}
                >
                  {t("addQuestion.add")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* -------------------- نافذة إضافة فئة -------------------- */}
      <Modal
        isOpen={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
        placement="center"
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>{t("addCategory.title")}</ModalHeader>
              <ModalBody>
                <Input
                  label={t("addCategory.name")}
                  placeholder={t("addCategory.namePlaceholder")}
                  value={newCategory.name}
                  onValueChange={v =>
                    setNewCategory({
                      name: v,
                      id: v.toLowerCase().replace(/\s+/g, "-")
                    })
                  }
                  isRequired
                />
                <Input
                  label={t("addCategory.id")}
                  placeholder={t("addCategory.idPlaceholder")}
                  value={newCategory.id}
                  onValueChange={v => setNewCategory(prev => ({ ...prev, id: v }))}
                  isRequired
                />
                <p className="text-xs text-default-500 mt-1">
                  {t("addCategory.idHelper")}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  {t("app.cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddCategory}
                  isDisabled={!newCategory.name || !newCategory.id}
                >
                  {t("addCategory.add")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
