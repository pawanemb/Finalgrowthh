'use client';

import { useState } from 'react';
import { Plus, Loader2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ProjectCard } from '@/components/dashboard/project-card';
import { NewProjectDialog } from '@/components/dashboard/new-project-dialog';
import { useProjects } from '@/hooks/use-projects';

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { projects, isLoading } = useProjects();

  const AddNewProjectCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
      onClick={() => setIsDialogOpen(true)}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-all cursor-pointer group border-dashed border-2 bg-muted/50 flex flex-col items-center justify-center hover:border-primary hover:bg-muted/80">
        <div className="p-3 bg-primary/10 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform">
          <Plus className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-xl text-center group-hover:text-primary transition-colors">
          Add New Project
        </h3>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px] mx-auto">
          Create a new SEO project to optimize
        </p>
      </Card>
    </motion.div>
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Manage your SEO projects and track their performance
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr"
        >
          <AddNewProjectCard />
          
          {projects?.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              delay={index * 0.1}
            />
          ))}

          {projects?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sm:col-span-2 lg:col-span-3"
            >
              <Card className="p-8 text-center bg-muted/50">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first project to start optimizing your content and improving your SEO performance.
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      <NewProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}