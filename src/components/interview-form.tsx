import React from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Tabs,
  Tab,
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

import { ScrollableTabs } from "./scrollable-tabs";
import { CandidateInfo } from "./candidate-info";
import { QuestionSelectionList } from "./question-selection-list";
import { QuestionList } from "./question-list";
import { InterviewSummary } from "./interview-summary";

import {
  CandidateType,
  InterviewerType,
  QuestionResponseType,
  QuestionType,
} from "../types/interview";
import { questionCategories as defaultCategories } from "../data/questions";

const STORAGE_KEY = "nodeRecruit_state_v5";
localStorage.removeItem('nodeRecruit_state_v4');


interface Category {
  id: string;
  name: string;
  questions: QuestionType[];
}

export const InterviewForm: React.FC = () => {
  const { t } = useTranslation();

  const loadPersisted = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const persisted = loadPersisted();

  const [candidate, setCandidate] = React.useState<CandidateType>(
    persisted?.candidate ?? {
      name: "",
      position: "",
      email: "",
      phone: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }
  );

  const [interviewer, setInterviewer] = React.useState<InterviewerType>(
    persisted?.interviewer ?? { name: "", position: "" }
  );

  const [categories, setCategories] = React.useState<Category[]>(
    persisted?.categories ?? JSON.parse(JSON.stringify(defaultCategories))
  );

  const [responses, setResponses] = React.useState<QuestionResponseType[]>(
    persisted?.responses ?? []
  );
  const [selectedQuestions, setSelectedQuestions] = React.useState<string[]>(
    persisted?.selectedQuestions ?? []
  );
  const [candidateImage, setCandidateImage] = React.useState<string | null>(
    persisted?.candidateImage ?? null
  );
  const [formStep, setFormStep] = React.useState<
    "info" | "questions" | "test"
  >(persisted?.formStep ?? "info");
  const [showSummary, setShowSummary] = React.useState(false);
  const [isPdfExporting, setIsPdfExporting] = React.useState(false);

  const [showAddQuestionModal, setShowAddQuestionModal] = React.useState(false);
  const [newQuestion, setNewQuestion] = React.useState({
    text: "",
    level: "Beginner level",
    category: "",
  });

  const [showAddCategoryModal, setShowAddCategoryModal] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({ name: "", id: "" });

  const summaryRef = React.useRef<HTMLDivElement>(null);


  const persistState = React.useCallback(
    (extra?: Partial<Record<string, unknown>>) => {
      const data = {
        candidate,
        interviewer,
        categories,
        responses,
        selectedQuestions,
        candidateImage,
        formStep,
        ...extra,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    [
      candidate,
      interviewer,
      categories,
      responses,
      selectedQuestions,
      candidateImage,
      formStep,
    ]
  );

  React.useEffect(() => {
    persistState();
  }, [persistState]);

  const handleCandidateChange = (field: keyof CandidateType, v: string) =>
    setCandidate((p) => ({ ...p, [field]: v }));

  const handleInterviewerChange = (field: keyof InterviewerType, v: string) =>
    setInterviewer((p) => ({ ...p, [field]: v }));

  const handleResponseChange = (
    id: string,
    answered: boolean,
    isCorrect?: boolean
  ) =>
    setResponses((prev) => {
      const idx = prev.findIndex((r) => r.questionId === id);
      const item = { questionId: id, answered, isCorrect };
      return idx >= 0
        ? prev.map((r, i) => (i === idx ? item : r))
        : [...prev, item];
    });

  const handleQuestionSelection = (id: string, sel: boolean) =>
    setSelectedQuestions((prev) =>
      sel ? [...prev, id] : prev.filter((x) => x !== id)
    );

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.id) return;
    setCategories((prev) => [
      ...prev,
      { ...newCategory, questions: [] as QuestionType[] },
    ]);
    setNewCategory({ name: "", id: "" });
    setShowAddCategoryModal(false);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.text || !newQuestion.category) return;
    const id = `custom-${Date.now()}`;
    const q: QuestionType = { id, ...newQuestion };
    setCategories((prev) =>
      prev.map((c) =>
        c.id === newQuestion.category
          ? { ...c, questions: [...c.questions, q] }
          : c
      )
    );
    setSelectedQuestions((prev) => [...prev, id]);
    setNewQuestion({ text: "", level: "Beginner level", category: "" });
    setShowAddQuestionModal(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        questions: c.questions.filter((q) => q.id !== id),
      }))
    );
    setSelectedQuestions((prev) => prev.filter((q) => q !== id));
    setResponses((prev) => prev.filter((r) => r.questionId !== id));
  };

  const validateInfoForm = () =>
    candidate.name.trim() !== "" && interviewer.name.trim() !== "";

  const handleInfoSubmit = () => validateInfoForm() && setFormStep("questions");

  const handleStartCustomTest = () =>
    selectedQuestions.length > 0 && setFormStep("test");

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const handleExportPDF = async () => {
    if (!summaryRef.current) return;
    setIsPdfExporting(true);
    await new Promise((r) => setTimeout(r, 100));

    const { jsPDF } = await import("jspdf");
    const html2canvas = await import("html2canvas");

    const canvas = await html2canvas.default(summaryRef.current, {
      scale: 2,
    });
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


  const filteredCategories = React.useMemo(() => {
    if (formStep !== "test") return categories;
    return categories
      .map((c) => ({
        ...c,
        questions: c.questions.filter((q) => selectedQuestions.includes(q.id)),
      }))
      .filter((c) => c.questions.length);
  }, [categories, formStep, selectedQuestions]);

  const totalQuestions = filteredCategories.reduce(
    (sum, c) => sum + c.questions.length,
    0
  );
  const answeredQuestions = responses.filter((r) => r.answered).length;

  return (
    <div className="max-w-4xl mx-auto">
      {showSummary ? (
        <InterviewSummary
          ref={summaryRef}
          candidate={candidate}
          interviewer={interviewer}
          responses={responses}
          totalQuestions={totalQuestions}
          onBack={() => setShowSummary(false)}
          onExportPDF={handleExportPDF}
          categories={filteredCategories}
          candidateImage={candidateImage}
          isPdfExporting={isPdfExporting}
        />
      ) : (
        <Card className="shadow-md mt-6">
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t("app.title")}</h2>

              {formStep === "questions" && (
                <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
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

            {formStep === "info" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <CandidateInfo
                      candidate={candidate}
                      interviewer={interviewer}
                      onChange={handleCandidateChange}
                      onInterviewerChange={handleInterviewerChange}
                    />
                  </div>

                  <PhotoUploader
                    image={candidateImage}
                    onUpload={setCandidateImage}
                    t={t}
                  />
                </div>

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

            {formStep === "questions" && (
              <QuestionSelectionList
                categories={categories}
                selectedQuestions={selectedQuestions}
                onQuestionSelection={handleQuestionSelection}
                onDeleteQuestion={handleDeleteQuestion}
              />
            )}

            {formStep === "test" && (
              <form onSubmit={handleSubmitTest}>
                <h3 className="text-xl font-semibold mb-4">
                  {t("questions.title")}
                </h3>

                <ScrollableTabs
                  items={filteredCategories}
                  getId={(c) => c.id}
                  getTitle={(c) => (
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                        {c.questions.length}
                      </span>
                    </div>
                  )}
                >
                  {(cat) => (
                    <QuestionList
                      questions={cat.questions}
                      responses={responses}
                      onResponseChange={handleResponseChange}
                      onDelete={handleDeleteQuestion}
                    />
                  )}
                </ScrollableTabs>

                <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
                  <ProgressBar
                    answered={answeredQuestions}
                    total={totalQuestions}
                    t={t}
                  />
                  <Button color="primary" type="submit">
                    {t("app.submit")}
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      )}

      <AddQuestionModal
        open={showAddQuestionModal}
        onOpenChange={setShowAddQuestionModal}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        categories={categories}
        onAdd={handleAddQuestion}
        t={t}
      />

      <AddCategoryModal
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        t={t}
        onAdd={handleAddCategory}
      />
    </div>
  );
};

const PhotoUploader = ({
  image,
  onUpload,
  t,
}: {
  image: string | null;
  onUpload: (src: string | null) => void;
  t: (k: string) => string;
}) => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-full aspect-square bg-default-100 rounded-lg overflow-hidden flex items-center justify-center">
      {image ? (
        <img
          src={image}
          alt={t("candidate.photo")}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <Icon icon="lucide:user" className="w-1/3 h-1/3 text-default-300" />
      )}
    </div>

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
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = (ev) => onUpload(ev.target?.result as string);
          r.readAsDataURL(f);
        }}
      />
    </label>

    {image && (
      <Button
        fullWidth
        variant="flat"
        color="danger"
        startContent={<Icon icon="lucide:trash-2" />}
        onPress={() => onUpload(null)}
      >
        {t("candidate.removePhoto")}
      </Button>
    )}
  </div>
);

const ProgressBar = ({
  answered,
  total,
  t,
}: {
  answered: number;
  total: number;
  t: (k: string) => string;
}) => (
  <div>
    <p className="text-default-600">
      {t("questions.answered")}:{" "}
      <span className="font-semibold">
        {answered}/{total}
      </span>
    </p>
    <div className="w-64 h-2 bg-default-100 rounded-full mt-2">
      <div
        className="h-full bg-primary rounded-full"
        style={{ width: `${(answered / total) * 100 || 0}%` }}
      />
    </div>
  </div>
);

const AddQuestionModal = ({
  open,
  onOpenChange,
  newQuestion,
  setNewQuestion,
  categories,
  onAdd,
  t,
}: any) => (
  <Modal isOpen={open} onOpenChange={onOpenChange} placement="center">
    <ModalContent>
      {(onClose: () => void) => (
        <>
          <ModalHeader>{t("addQuestion.title")}</ModalHeader>
          <ModalBody>
            <Textarea
              label={t("addQuestion.text")}
              placeholder={t("addQuestion.textPlaceholder")}
              value={newQuestion.text}
              onValueChange={(v: string) =>
                setNewQuestion((p: any) => ({ ...p, text: v }))
              }
              minRows={3}
              isRequired
            />

            <div className="grid grid-cols-1 gap-4 mt-4">
              <select
                className="w-full p-2 border rounded-md"
                value={newQuestion.level}
                onChange={(e) =>
                  setNewQuestion((p: any) => ({ ...p, level: e.target.value }))
                }
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
                onChange={(e) =>
                  setNewQuestion((p: any) => ({
                    ...p,
                    category: e.target.value,
                  }))
                }
                required
              >
                <option value="">{t("addQuestion.category")}</option>
                {categories.map((c: any) => (
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
              onPress={onAdd}
              isDisabled={!newQuestion.text || !newQuestion.category}
            >
              {t("addQuestion.add")}
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

const AddCategoryModal = ({
  open,
  onOpenChange,
  newCategory,
  setNewCategory,
  onAdd,
  t,
}: any) => (
  <Modal isOpen={open} onOpenChange={onOpenChange} placement="center">
    <ModalContent>
      {(onClose: () => void) => (
        <>
          <ModalHeader>{t("addCategory.title")}</ModalHeader>
          <ModalBody>
            <Input
              label={t("addCategory.name")}
              placeholder={t("addCategory.namePlaceholder")}
              value={newCategory.name}
              onValueChange={(v) =>
                setNewCategory({ name: v, id: v.toLowerCase().replace(/\s+/g, "-") })
              }
              isRequired
            />
            <Input
              label={t("addCategory.id")}
              placeholder={t("addCategory.idPlaceholder")}
              value={newCategory.id}
              onValueChange={(v) =>
                setNewCategory((p: any) => ({ ...p, id: v }))
              }
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
              onPress={onAdd}
              isDisabled={!newCategory.name || !newCategory.id}
            >
              {t("addCategory.add")}
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);
