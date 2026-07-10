import React from 'react';
import { ChevronDown, Flame } from 'lucide-react';
import type { Sport, AgeGroup } from '../types';

interface SportSelectProps {
  sports: Sport[];
  ageGroups: AgeGroup[];
  selectedSport: string;
  selectedAge: string;
  onSportChange: (slug: string) => void;
  onAgeChange: (age: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}

export function SportSelect({
  sports,
  ageGroups,
  selectedSport,
  selectedAge,
  onSportChange,
  onAgeChange,
  onSubmit,
  loading,
  disabled,
}: SportSelectProps) {
  const canSubmit = selectedSport && selectedAge && !loading;

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
      {/* 运动项目下拉 */}
      <div className="relative flex-1">
        <select
          value={selectedSport}
          onChange={(e) => onSportChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none pl-5 pr-12 py-3 md:py-3.5 bg-slate-50 border-2 border-slate-100 rounded-full text-base font-medium text-slate-800 focus:outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="text-slate-400">选择运动项目...</option>
          {sports.map((sport) => (
            <option key={sport.slug} value={sport.slug}>
              {sport.icon} {sport.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>

      {/* 年龄段下拉 */}
      <div className="relative flex-1 sm:max-w-[200px]">
        <select
          value={selectedAge}
          onChange={(e) => onAgeChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none pl-5 pr-12 py-3 md:py-3.5 bg-slate-50 border-2 border-slate-100 rounded-full text-base font-medium text-slate-800 focus:outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" className="text-slate-400">选择年龄段...</option>
          {ageGroups.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>

      {/* 开始按钮 */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="flex-shrink-0 px-8 py-3 md:py-3.5 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-full font-bold text-base shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
      >
        <Flame size={20} />
        {loading ? '加载中...' : '开始热身'}
      </button>
    </div>
  );
}
