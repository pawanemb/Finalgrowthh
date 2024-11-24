'use client';

import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/auth-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-background bg-[linear-gradient(to_bottom_right,var(--background)_40%,transparent_50%),radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb),0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(var(--primary-rgb),0.15),transparent_50%)]">
      <div className="container flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tighter mb-2"
            >
              <span className="text-primary">Growthh.ai</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Sign in to your account or create a new one
            </motion.p>
          </div>
          <div className="flex justify-center">
            <AuthForm />
          </div>
        </motion.div>
      </div>
    </main>
  );
}