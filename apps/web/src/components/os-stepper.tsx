'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OSStepperProps {
  currentStatus: string;
}

const steps = [
  { label: 'Entrada', key: 'ENTRADA' },
  { label: 'Orçamento', key: 'ORCAMENTO' },
  { label: 'Aprovado', key: 'ABERTO' },
  { label: 'Execução', key: 'ANDAMENTO' },
  { label: 'Concluído', key: 'CONCLUIDO' },
  { label: 'Faturado', key: 'FATURADO' },
];

export function OSStepper({ currentStatus }: OSStepperProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStatus) || 0;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex || (currentStatus === 'FATURADO' && index === steps.length - 1);
          const isCurrent = step.key === currentStatus;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Linha conectora */}
              {index !== 0 && (
                <div 
                  className={cn(
                    "absolute top-4 -left-1/2 w-full h-[2px] -z-10",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Círculo */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : isCurrent 
                      ? "border-primary bg-card text-primary" 
                      : "border-border bg-surface-inset text-muted-foreground"
                )}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
              </div>

              {/* Label */}
              <span 
                className={cn(
                  "mt-2 text-[10px] uppercase font-bold tracking-wider",
                  isCurrent ? "text-primary" : "text-zinc-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
