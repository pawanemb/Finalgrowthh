'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { analyzeWithOpenAI } from '@/lib/openai';
import { toast } from 'sonner';

interface ProjectStepOneProps {
  data: {
    name: string;
    url: string;
    services: string[];
  };
  onUpdate: (data: Partial<any>) => void;
  onNext: () => void;
}

export function ProjectStepOne({ data, onUpdate, onNext }: ProjectStepOneProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNameChange = (name: string) => {
    onUpdate({ name });
  };

  const handleUrlChange = (url: string) => {
    onUpdate({ url });
  };

  const analyzeWebsite = async () => {
    if (!data.url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    if (!data.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeWithOpenAI(data.url);
      
      onUpdate({
        services: analysis.services || [],
        target_audience: {
          gender: analysis.targetAudience?.gender || [],
          languages: analysis.targetAudience?.languages || [],
          location: analysis.targetAudience?.location || [],
          industry: [analysis.industry] || []
        }
      });

      toast.success('Website analyzed successfully');
      onNext();
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze website');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Project Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter your project details
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="Enter your project name"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL</Label>
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={data.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={analyzeWebsite}
          disabled={isAnalyzing || !data.url.trim() || !data.name.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isAnalyzing ? 'Analyzing Website...' : 'Analyze Website'}
        </Button>
      </div>
    </div>
  );
}