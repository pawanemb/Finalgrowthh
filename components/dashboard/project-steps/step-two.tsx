'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectStepTwoProps {
  data: {
    url: string;
    services: string[];
  };
  onUpdate: (data: Partial<{ services: string[] }>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProjectStepTwo({ data, onUpdate, onNext, onPrevious }: ProjectStepTwoProps) {
  const [newService, setNewService] = useState('');

  const addService = () => {
    if (newService.trim()) {
      onUpdate({ services: [...(data.services || []), newService.trim()] });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    onUpdate({
      services: data.services.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Project Services</h2>
        <p className="text-sm text-muted-foreground">
          Add or modify the detected services
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter service name"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addService()}
          />
          <Button type="button" onClick={addService} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence>
          {(!data.services || data.services.length === 0) ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-muted-foreground py-4"
            >
              No services detected. Add services manually.
            </motion.p>
          ) : (
            <div className="space-y-2">
              {data.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 bg-muted/50 rounded-md p-2"
                >
                  <span className="flex-1">{service}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeService(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}