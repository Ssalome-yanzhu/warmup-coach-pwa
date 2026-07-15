// 运动项目
export interface Sport {
  id: number;
  name: string;
  icon: string;
  slug: string;
  warmupDuration: string;
  stretchDuration: string;
}

// 单个动作
export interface Exercise {
  id: number;
  code: string;
  name: string;
  category: string;
  defaultDesc: string;
  videoPath: string;
  defaultDuration: number;
}

// 方案中的一步（从数据库查出的完整信息）
export interface RoutineStep {
  sortOrder: number;
  title: string;
  description: string;
  executionType: string;
  videoUrl: string;
  category: string;
}

// API 返回的完整方案
export interface RoutineResponse {
  sportName: string;
  coachMessage: string;
  steps: RoutineStep[];
}

// 年龄组
export interface AgeGroup {
  value: string;
  label: string;
}

// 方案类型
export type RoutineType = 'warmup' | 'stretch';
