-- ============================================
-- 热身魔法师 - 数据库建表脚本
-- ============================================

-- 运动项目表
CREATE TABLE IF NOT EXISTS sports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,          -- 项目名称：游泳、篮球...
  icon TEXT NOT NULL,                 -- emoji 图标
  slug TEXT NOT NULL UNIQUE,          -- URL 友好名
  warmup_duration TEXT NOT NULL,      -- 建议热身时长，如 "5-8分钟"
  stretch_duration TEXT NOT NULL      -- 建议拉伸时长
);

-- 动作库表
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 代号：A, B, C... AB
  name TEXT NOT NULL,                 -- 动作名称
  category TEXT NOT NULL,             -- 分类：全身运动/肩颈热身/手臂热身/躯干热身/腿部热身
  default_desc TEXT NOT NULL,         -- 默认动作描述
  video_path TEXT,                    -- 视频文件路径，如 "L_肩部绕环.mp4"
  default_duration_seconds INTEGER NOT NULL DEFAULT 60,  -- 默认时长（秒）
  execution_type TEXT NOT NULL DEFAULT '动态热身',        -- 执行类型，决定时长/次数规则
  tips TEXT,                           -- 动作要点
  purpose TEXT                         -- 训练目的标签，逗号分隔，如 "提高心率, 激活下肢"
);

-- 热身方案表（运动 → 动作关联）
CREATE TABLE IF NOT EXISTS warmup_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sport_id INTEGER NOT NULL REFERENCES sports(id),
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  sort_order INTEGER NOT NULL,        -- 排序
  duration_seconds INTEGER,           -- 该运动中此动作的特定时长（秒），NULL则用默认
  duration_display TEXT,              -- 显示文本，如 "30秒"、"各10次"
  notes TEXT,                         -- 该运动特定备注
  UNIQUE(sport_id, exercise_id, sort_order)
);

-- 拉伸方案表（后期录入，结构与热身相同）
CREATE TABLE IF NOT EXISTS stretch_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sport_id INTEGER NOT NULL REFERENCES sports(id),
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  sort_order INTEGER NOT NULL,
  duration_seconds INTEGER,
  duration_display TEXT,
  notes TEXT,
  UNIQUE(sport_id, exercise_id, sort_order)
);

-- 年龄段文案表（后期录入）
CREATE TABLE IF NOT EXISTS age_language (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  age_group TEXT NOT NULL,            -- 年龄段：6-8岁/9-10岁/11-12岁/13-15岁
  adapted_desc TEXT,                  -- 改写后的动作描述
  encouragement TEXT,                 -- 鼓励语
  coach_intro TEXT,                   -- 该年龄段教练开场白（关联运动时使用）
  UNIQUE(exercise_id, age_group)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_warmup_sport ON warmup_plans(sport_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_stretch_sport ON stretch_plans(sport_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_age_lang ON age_language(exercise_id, age_group);
