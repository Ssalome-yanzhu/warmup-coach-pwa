import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, Timer, AlertCircle } from 'lucide-react';
import type { RoutineStep } from '../types';

interface VideoPlayerProps {
  steps: RoutineStep[];
  currentStepIndex: number;
  onStepComplete: () => void;
  onStepChange: (index: number) => void;
}

export function VideoPlayer({
  steps,
  currentStepIndex,
  onStepComplete,
  onStepChange,
}: VideoPlayerProps) {
  const currentStep = steps[currentStepIndex];
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentStep?.durationSeconds || 0);
  const [timerFinished, setTimerFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 切换步骤时重置计时器
  useEffect(() => {
    if (currentStep) {
      setTimeLeft(currentStep.durationSeconds);
      setTimerRunning(false);
      setTimerFinished(false);
    }
  }, [currentStepIndex, currentStep]);

  // 计时器逻辑
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timeLeft]);

  const toggleTimer = useCallback(() => {
    if (timerFinished) {
      // 重新开始
      setTimeLeft(currentStep?.durationSeconds || 0);
      setTimerFinished(false);
      setTimerRunning(true);
    } else {
      setTimerRunning((prev) => !prev);
    }
  }, [timerFinished, currentStep]);

  const handleNext = useCallback(() => {
    setTimerRunning(false);
    setTimerFinished(false);
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    } else {
      onStepComplete();
    }
  }, [currentStepIndex, steps.length, onStepChange, onStepComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 没有视频时的占位
  const hasVideo = !!currentStep?.videoUrl;

  return (
    <div className="flex flex-col h-full">
      {/* 视频区域 */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video shadow-lg flex-shrink-0">
        {hasVideo ? (
          <video
            src={currentStep.videoUrl}
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-3xl">
                {currentStep?.category === '肩颈热身' ? '🔆' :
                 currentStep?.category === '手臂热身' ? '💪' :
                 currentStep?.category === '躯干热身' ? '🔄' :
                 currentStep?.category === '腿部热身' ? '🦵' : '🏃'}
              </span>
            </div>
            <p className="text-sm font-medium">视频准备中</p>
            <p className="text-xs text-white/40">拍摄后放入 videos/ 目录即可显示</p>
          </div>
        )}

        {/* 计时器浮层 */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`px-4 py-2 rounded-full font-bold text-lg font-mono shadow-lg backdrop-blur-sm transition-all ${
                timerFinished
                  ? 'bg-green-500 text-white'
                  : timeLeft <= 10 && timerRunning
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-black/60 text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Timer size={18} />
                {timerFinished ? '✓ 完成!' : formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95 ${
                timerRunning
                  ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                  : timerFinished
                  ? 'bg-green-400 text-green-900 hover:bg-green-300'
                  : 'bg-white/90 text-slate-800 hover:bg-white'
              }`}
              title={timerRunning ? '暂停' : timerFinished ? '重新开始' : '开始计时'}
            >
              {timerRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm hover:bg-white transition-all active:scale-95"
              title={currentStepIndex < steps.length - 1 ? '下一个动作' : '完成'}
            >
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 当前动作信息条 */}
      <div className="mt-3 px-1 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm shadow-sm">
            {currentStepIndex + 1}
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{currentStep?.title}</h3>
            <p className="text-xs text-slate-500">{currentStep?.category} · {currentStep?.duration}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {currentStepIndex + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}
