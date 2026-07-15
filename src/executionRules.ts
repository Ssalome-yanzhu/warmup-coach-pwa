// ============================================
// 动作执行规则 — 统一定义所有动作的时长/次数标准
// 数据库只存动作类型，前端根据类型显示对应规则
// ============================================

export interface ExecutionRule {
  type: string;            // execution_type 值
  label: string;           // 规则说明标签
  durationSeconds: number | null;  // 时长（null 表示按次数/组数）
  display: string;         // 显示文本
}

export const EXECUTION_RULES: Record<string, ExecutionRule> = {
  '缓降':         { type: '缓降', label: '缓降动作', durationSeconds: 60, display: '1分钟' },
  '全身放松':     { type: '全身放松', label: '全身放松', durationSeconds: 30, display: '30秒' },
  '慢跑':         { type: '慢跑', label: '慢跑', durationSeconds: 120, display: '2分钟' },
  '动态热身':     { type: '动态热身', label: '动态热身动作', durationSeconds: 20, display: '20秒' },
  '动态活动':     { type: '动态活动', label: '绕环、转体等活动动作', durationSeconds: null, display: '10次' },
  '行进间活动':   { type: '行进间活动', label: '行进间活动', durationSeconds: null, display: '各10次' },
  '组合激活':     { type: '组合激活', label: '弹力带等抗阻激活', durationSeconds: null, display: '8组' },
  '单侧静态拉伸': { type: '单侧静态拉伸', label: '单侧静态拉伸', durationSeconds: 20, display: '20秒/侧' },
  '双侧静态拉伸': { type: '双侧静态拉伸', label: '双侧静态拉伸', durationSeconds: 20, display: '20秒' },
  '平板支撑':     { type: '平板支撑', label: '平板支撑', durationSeconds: 20, display: '20秒' },
};

/** 根据动作执行类型获取显示文本 */
export function getDurationDisplay(executionType: string): string {
  return EXECUTION_RULES[executionType]?.display ?? '';
}

/** 获取方案中涉及的执行规则汇总（去重），用于页面顶部展示 */
export function getRulesSummary(executionTypes: string[]): ExecutionRule[] {
  const seen = new Set<string>();
  const rules: ExecutionRule[] = [];
  for (const t of executionTypes) {
    const rule = EXECUTION_RULES[t];
    if (rule && !seen.has(rule.type)) {
      seen.add(rule.type);
      rules.push(rule);
    }
  }
  return rules;
}
