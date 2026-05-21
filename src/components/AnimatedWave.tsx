/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface AnimatedWaveProps {
  color?: string;
  isActive?: boolean;
}

export function AnimatedWave({ color = 'bg-rose-500', isActive = false }: AnimatedWaveProps) {
  // 5 bars jumping at different speeds/heights
  const bars = [
    { delay: 0.1, duration: 0.6, height: 'h-4' },
    { delay: 0.3, duration: 0.5, height: 'h-6' },
    { delay: 0.0, duration: 0.7, height: 'h-8' },
    { delay: 0.4, duration: 0.4, height: 'h-5' },
    { delay: 0.2, duration: 0.8, height: 'h-7' },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full shadow-inner">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          initial={{ height: '4px' }}
          animate={
            isActive
              ? {
                  height: ['4px', '28px', '4px'],
                }
              : { height: '4px' }
          }
          transition={
            isActive
              ? {
                  duration: bar.duration,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: bar.delay,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
      <span className="text-[10px] font-mono font-medium text-slate-400 tracking-wider uppercase ml-1.5">
        {isActive ? 'Voce Attiva' : 'Pronto'}
      </span>
    </div>
  );
}
