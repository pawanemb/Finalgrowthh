'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ProjectStepOne } from './project-steps/step-one';
import { ProjectStepTwo } from './project-steps/step-two';
import { ProjectStepThree } from './project-steps/step-three';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/use-projects';
import type { NewProject } from '@/types';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormData: NewProject = {
  name: '',
  url: '',
  services: [],
  target_audience: {
    gender: [],
    languages: [],
    location: [],
    industry: []
  }
};

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<NewProject>(initialFormData);
  const { addProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (data: Partial<NewProject>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setStep(1);
    setFormData(initialFormData);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addProject(formData);
      handleClose();
    } catch (error) {
      // Error handling is done in useProjects hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogTitle className="sr-only">New Project</DialogTitle>
        <div className="p-6">
          <div className="relative mb-8">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors relative z-10",
                    stepNumber === step
                      ? "bg-primary text-primary-foreground"
                      : stepNumber < step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <ProjectStepOne
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={handleNext}
                />
              )}
              {step === 2 && (
                <ProjectStepTwo
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              )}
              {step === 3 && (
                <ProjectStepThree
                  data={formData}
                  onUpdate={updateFormData}
                  onPrevious={handlePrevious}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}