import React from "react";
import { Input, Divider } from "@heroui/react";
import { CandidateType, InterviewerType } from "../types/interview";
import { useTranslation } from 'react-i18next';

interface CandidateInfoProps {
  candidate: CandidateType;
  interviewer: InterviewerType;
  onChange: (field: keyof CandidateType, value: string) => void;
  onInterviewerChange: (field: keyof InterviewerType, value: string) => void;
}

export const CandidateInfo = ({ 
  candidate, 
  interviewer, 
  onChange, 
  onInterviewerChange 
}: CandidateInfoProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">{t('candidate.info')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('candidate.fullName')}
          placeholder={t('candidate.fullNamePlaceholder')}
          value={candidate.name}
          onValueChange={(value) => onChange("name", value)}
          isRequired
          variant="bordered"
          color={candidate.name.trim() === '' ? "danger" : "default"}
        />
        
        <Input
          label={t('candidate.position')}
          placeholder={t('candidate.positionPlaceholder')}
          value={candidate.position}
          onValueChange={(value) => onChange("position", value)}
          variant="bordered"
        />
        
        <Input
          label={t('candidate.email')}
          placeholder={t('candidate.emailPlaceholder')}
          value={candidate.email}
          onValueChange={(value) => onChange("email", value)}
          type="email"
          variant="bordered"
        />
        
        <Input
          label={t('candidate.phone')}
          placeholder={t('candidate.phonePlaceholder')}
          value={candidate.phone}
          onValueChange={(value) => onChange("phone", value)}
          variant="bordered"
        />
        
        <Input
          label={t('candidate.date')}
          type="date"
          value={candidate.date}
          onValueChange={(value) => onChange("date", value)}
          variant="bordered"
        />
        
        <Input
          label={t('candidate.time')}
          type="time"
          value={candidate.time}
          onValueChange={(value) => onChange("time", value)}
          variant="bordered"
        />
      </div>
      
      <Divider className="my-6" />
      
      <h3 className="text-xl font-semibold">{t('interviewer.info')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('interviewer.fullName')}
          placeholder={t('interviewer.fullNamePlaceholder')}
          value={interviewer.name}
          onValueChange={(value) => onInterviewerChange("name", value)}
          isRequired
          variant="bordered"
          color={interviewer.name.trim() === '' ? "danger" : "default"}
        />
        
        <Input
          label={t('interviewer.position')}
          placeholder={t('interviewer.positionPlaceholder')}
          value={interviewer.position}
          onValueChange={(value) => onInterviewerChange("position", value)}
          variant="bordered"
        />
      </div>
    </div>
  );
};