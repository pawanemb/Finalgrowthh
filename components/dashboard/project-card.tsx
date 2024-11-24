'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { memo, useState } from 'react';
import { useProjects } from '@/hooks/use-projects';

interface Project {
  id: string;
  name: string;
  url: string;
  industry: string;
}

interface ProjectCardProps {
  project: Project;
  delay?: number;
}

function ProjectCardComponent({ project, delay = 0 }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteProject } = useProjects();
  
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return '';
    }
  };

  const handleDelete = async () => {
    await deleteProject(project.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="h-full"
      >
        <Card className="p-6 h-full hover:shadow-lg transition-all group bg-card hover:bg-muted/5">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Image
                    src={getFaviconUrl(project.url)}
                    alt={project.name}
                    fill
                    className="object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xl group-hover:text-primary transition-colors truncate" title={project.name}>
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-0.5" title={project.url}>
                    {project.url}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-auto grid grid-cols-1 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Industry</p>
                <div className="flex items-center">
                  <span className="text-sm bg-background/80 px-3 py-1.5 rounded-md font-medium truncate" title={project.industry}>
                    {project.industry}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const ProjectCard = memo(ProjectCardComponent);