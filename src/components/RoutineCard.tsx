import { CheckCircle2, PlayCircle, Circle } from 'lucide-react';
import type { RoutineStep } from '../types';

interface RoutineCardProps {
  steps: RoutineStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export function RoutineCard({ steps, currentStepIndex, onStepClick }: RoutineCardProps) {
  return (
    <div className="space-y-2 h-full overflow-y-auto">
      {steps.map((step, index) => {
        const isCurrent = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const isUpcoming = index > currentStepIndex;

        return (
          <button
            key={index}
            onClick={() => onStepClick(index)}
            className={`w-full text-left rounded-2xl p-3 flex gap-3 items-start transition-all border-2 ${
              isCurrent
                ? 'bg-orange-50 border-orange-400 shadow-md shadow-orange-100 scale-[1.02]'
                : isCompleted
                ? 'bg-white/70 border-green-200 opacity-75'
                : 'bg-white/90 border-white hover:border-orange-200 hover:shadow-sm'
            }`}
          >
            {/* 序号/状态图标 */}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                isCurrent
                  ? 'bg-orange-500 text-white'
                  : isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} />
              ) : isCurrent ? (
                <PlayCircle size={16} className="fill-white" />
              ) : (
                index + 1
              )}
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3
                  className={`text-sm font-bold leading-tight truncate ${
                    isCurrent ? 'text-orange-700' : isCompleted ? 'text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {step.title}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                    isCurrent
                      ? 'bg-orange-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step.duration}
                </span>
              </div>
              <p
                className={`text-xs leading-snug ${
                  isCurrent ? 'text-orange-600 font-medium' : isCompleted ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {step.description}
              </p>
              {isCurrent && (
                <span className="inline-block mt-1.5 text-[10px] font-bold text-orange-400 bg-orange-100 px-2 py-0.5 rounded-full">
                  ● 正在进行
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
