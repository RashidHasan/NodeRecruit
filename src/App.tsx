import React from "react";
import { InterviewForm } from "./components/interview-form";
import { Header } from "./components/header";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <InterviewForm />
        </main>
      </div>
    </I18nextProvider>
  );
}