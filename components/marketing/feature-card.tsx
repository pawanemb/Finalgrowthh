'use client';

import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <AnimatedCard delay={delay} className="group h-full">
      <motion.div className="p-6 flex flex-col space-y-2">
        <motion.div
          className="text-primary transition-transform duration-300 group-hover:scale-110"
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        >
          {icon}
        </motion.div>
        <h3 className="font-semibold text-xl">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </motion.div>
    </AnimatedCard>
  );
}