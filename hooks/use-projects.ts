'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Project, NewProject } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

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

  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Clean up existing subscription if any
        if (channel) {
          await supabase.removeChannel(channel);
        }

        // Create new subscription
        const newChannel = supabase
          .channel(`projects-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'projects',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('INSERT event received:', payload);
              setProjects((current) => [payload.new as Project, ...current]);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'projects',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('DELETE event received:', payload);
              setProjects((current) => 
                current.filter((project) => project.id !== payload.old.id)
              );
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'projects',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('UPDATE event received:', payload);
              setProjects((current) =>
                current.map((project) =>
                  project.id === payload.new.id ? (payload.new as Project) : project
                )
              );
            }
          );

        const status = await newChannel.subscribe();
        console.log('Subscription status:', status);
        setChannel(newChannel);
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      }
    };
  }, []); // Empty dependency array as we want this to run once

  // Initial fetch and auth state changes
  useEffect(() => {
    fetchProjects();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchProjects();
      } else if (event === 'SIGNED_OUT') {
        setProjects([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProjects]);

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const addProject = async (projectData: NewProject): Promise<Project> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
    deleteProject,
    refreshProjects: fetchProjects,
  };
}