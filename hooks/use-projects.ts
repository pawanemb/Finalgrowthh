'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Project } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error(error.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchProjects();
      } else if (event === 'SIGNED_OUT') {
        setProjects([]);
        setUserId(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProjects]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`projects:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProjects(prev => [payload.new as Project, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(project => project.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => prev.map(project => 
              project.id === payload.new.id ? payload.new as Project : project
            ));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const addProject = async (projectData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Normalize URL for comparison
      const normalizedUrl = projectData.url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

      // Check for existing project with same normalized URL
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id, url')
        .eq('user_id', user.id)
        .filter('url', 'ilike', `%${normalizedUrl}%`)
        .maybeSingle();

      if (existingProject) {
        throw new Error('A project with this URL already exists');
      }

      const formattedProject = {
        name: projectData.name,
        url: projectData.url,
        industry: projectData.target_audience.industry?.[0] || 'Other',
        services: projectData.services || [],
        target_audience: {
          gender: projectData.target_audience.gender || [],
          languages: projectData.target_audience.languages || [],
          location: projectData.target_audience.location || []
        },
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([formattedProject])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A project with this URL already exists');
        }
        throw error;
      }

      toast.success('Project created successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast.error(error.message || 'Failed to create project');
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    addProject,
    refreshProjects: fetchProjects,
  };
}