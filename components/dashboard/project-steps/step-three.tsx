'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectStepThreeProps {
  data: {
    url: string;
    target_audience: {
      gender: string[];
      languages: string[];
      location: string[];
      industry: string[];
    };
  };
  onUpdate: (data: Partial<{ target_audience: typeof data.target_audience }>) => void;
  onPrevious: () => void;
  onSubmit: () => Promise<void>;
}

const categories = {
  industry: [
    'Technology',
    'Marketing & Advertising',
    'Healthcare',
    'Education',
    'Finance',
    'E-commerce',
    'Real Estate',
    'Travel & Tourism',
    'Manufacturing',
    'Retail',
    'Other'
  ],
  gender: ['Male', 'Female', 'Others'],
  languages: [
    'English',
    'French',
    'Spanish',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Other'
  ],
  location: [
    'North America',
    'South America',
    'Europe',
    'Asia Pacific',
    'Middle East',
    'Africa',
    'Australia & NZ',
    'Global'
  ],
};

export function ProjectStepThree({
  data,
  onUpdate,
  onPrevious,
  onSubmit,
}: ProjectStepThreeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = useCallback((category: keyof typeof categories, value: string) => {
    const currentValues = data.target_audience[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onUpdate({
      target_audience: {
        ...data.target_audience,
        [category]: newValues,
      },
    });
  }, [data.target_audience, onUpdate]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = useCallback((title: string, category: keyof typeof categories) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}:</h3>
      <div className="flex flex-wrap gap-2">
        {categories[category].map((value) => {
          const currentValues = data.target_audience[category] || [];
          const isSelected = currentValues.includes(value);
          return (
            <Badge
              key={value}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleTag(category, value)}
            >
              {value}
              {isSelected && (
                <X className="ml-1 h-3 w-3 hover:text-destructive" />
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  ), [data.target_audience, toggleTag]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Target Audience</h2>
        <p className="text-sm text-muted-foreground">
          Review or modify the detected target audience
        </p>
      </div>

      <div className="space-y-6">
        {renderSection('Industry', 'industry')}
        {renderSection('Gender', 'gender')}
        {renderSection('Languages', 'languages')}
        {renderSection('Location', 'location')}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Submit
        </Button>
      </div>
    </div>
  );
}