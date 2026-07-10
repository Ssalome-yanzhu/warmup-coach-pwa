import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Sport, Exercise, RoutineStep, RoutineResponse } from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

/** 获取所有运动项目 */
export function getSports(): Sport[] {
  const d = getDb();
  return d.prepare('SELECT id, name, icon, slug, warmup_duration as warmupDuration, stretch_duration as stretchDuration FROM sports ORDER BY id').all() as Sport[];
}

/** 年龄组列表 — 四级成长语言体系 */
export function getAgeGroups() {
  return [
    { value: '6-8', label: '6-8岁（想象游戏版）' },
    { value: '9-12', label: '9-12岁（动作目标版）' },
    { value: '13-15', label: '13-15岁（训练认知版）' },
    { value: '16-adult', label: '16岁-成人（专业训练版）' },
  ];
}

/** 根据 slug 获取运动项目 */
export function getSportBySlug(slug: string): Sport | undefined {
  const d = getDb();
  return d.prepare('SELECT id, name, icon, slug, warmup_duration as warmupDuration, stretch_duration as stretchDuration FROM sports WHERE slug = ?').get(slug) as Sport | undefined;
}

/** 获取热身或拉伸方案 */
export function getRoutine(sportSlug: string, ageGroup: string, type: 'warmup' | 'stretch'): RoutineResponse | null {
  const d = getDb();
  const sport = getSportBySlug(sportSlug);
  if (!sport) return null;

  const tableName = type === 'warmup' ? 'warmup_plans' : 'stretch_plans';

  const rows = d.prepare(`
    SELECT
      wp.sort_order as sortOrder,
      e.name as title,
      e.category,
      e.default_desc as description,
      COALESCE(wp.duration_display, (e.default_duration_seconds || '秒')) as duration,
      COALESCE(wp.duration_seconds, e.default_duration_seconds) as durationSeconds,
      e.video_path as videoPath,
      CASE WHEN e.video_path IS NOT NULL THEN '/videos/' || e.video_path ELSE NULL END as videoUrl
    FROM ${tableName} wp
    JOIN exercises e ON wp.exercise_id = e.id
    WHERE wp.sport_id = ?
    ORDER BY wp.sort_order
  `).all(sport.id) as any[];

  // 查年龄段文案（如有匹配的描述则替换默认描述）
  for (const row of rows) {
    const ageContent = d.prepare(`
      SELECT adapted_desc, encouragement FROM age_language
      WHERE exercise_id = (SELECT id FROM exercises WHERE name = ?)
      AND age_group = ?
    `).get(row.title, ageGroup) as any;

    if (ageContent?.adapted_desc) {
      row.description = ageContent.adapted_desc;
    }
  }

  const coachMessage = getCoachMessage(sport.name, ageGroup);

  return {
    sportName: sport.name,
    coachMessage,
    steps: rows as RoutineStep[],
  };
}

/** 生成教练开场白 — 四级成长语言体系 */
function getCoachMessage(sportName: string, ageGroup: string): string {
  const messages: Record<string, Record<string, string>> = {
    '6-8': {
      '游泳': '🌟 小朋友你好呀！我是小酷教练！今天我们要做游泳前的热身操，像小鱼一样灵活起来！准备好了吗？我们开始吧！',
      '攀岩': '🧗 嗨，勇敢的小攀登家！我是小酷教练！攀岩前要把手指和肩膀都活动开哦，来跟我一起做！',
      '网球': '🎾 小网球手你好！我是小酷教练！打球之前，我们要把手臂转一转、身体扭一扭，准备好了吗？',
      '篮球': '🏀 小篮球明星来啦！我是小酷教练！投篮前要先让身体热起来，这样投得才准哦！',
      '足球': '⚽ 小足球将你好！我是小酷教练！踢球前要把腿腿活动开，跑起来才快呢！',
      '乒乓球': '🏓 小球王来啦！我是小酷教练！打乒乓球前要转转手腕扭扭腰，准备好了吗？',
      '跳绳': '➰ 跳绳小能手你好！我是小酷教练！跳之前要活动好手腕和脚腕，这样跳得又多又稳！',
      '跑步': '🏃 小飞人你好呀！我是小酷教练！跑步前要做热身，让你跑得像风一样快！',
      '日常锻炼': '💪 小朋友你好！我是小酷教练！运动前要热身，这样才能不受伤、身体棒棒！我们开始吧！',
      '羽毛球': '🏸 小羽毛球手你好！我是小酷教练！打羽毛球前要把手臂和身体转一转，准备好了吗？我们开始吧！',
    },
    '9-12': {
      '游泳': '🏊 同学你好！我是小酷教练！游泳热身重点是肩关节活动度和下肢激活，每个动作做到位，下水才安全。准备好了就开始！',
      '攀岩': '🧗 攀岩热身开始！我是小酷教练。攀岩对手指、手腕、肩部要求很高，认真完成每一步热身，攀爬会更安全。',
      '网球': '🎾 网球热身时间！我是小酷教练。网球是全身协调运动，热身重点在肩部、核心旋转和下肢移动。准备好了就开始！',
      '篮球': '🏀 篮球热身来了！我是小酷教练。投篮、跳跃、变向都需要关节充分激活，跟着步骤认真完成！',
      '足球': '⚽ 足球热身！我是小酷教练。足球运动量大，下肢和核心是关键。做好热身，场上表现会更好！',
      '乒乓球': '🏓 乒乓球热身！我是小酷教练。手腕灵活、腰部旋转、快速步法是乒乓球的三大要素，热身帮你反应更快！',
      '跳绳': '➰ 跳绳热身！我是小酷教练。手腕发力、脚踝支撑、核心稳定是跳绳的关键，做好热身避免受伤！',
      '跑步': '🏃 跑步热身开始！我是小酷教练。动态拉伸优于静态拉伸，重点激活小腿和踝关节。跟着节奏来！',
      '日常锻炼': '💪 运动前先热身！我是小酷教练。充分的热身能预防受伤、提升运动表现。认真完成每一步！',
      '羽毛球': '🏸 羽毛球热身！我是小酷教练。羽毛球需要肩部、手腕和全身协调，热身重点是上肢灵活性和步法移动。准备好了就开始！',
    },
    '13-15': {
      '游泳': '🏊 游泳热身。肩关节是游泳最易受伤的部位，需大幅度绕环激活。下水前必须完成陆上热身，下水后先慢游再加速。',
      '攀岩': '🧗 攀岩热身准备。手指、手腕、肩部是攀岩的核心发力部位，需专项激活。请认真完成每一步。',
      '网球': '🎾 网球热身。肩部和手腕是重点保护部位，挥拍动作强调转肩发力。注意感受身体旋转链条的激活。',
      '篮球': '🏀 篮球热身。重点活动手腕、脚踝、膝关节和髋关节，为跳跃和变向做好准备。感受每个关节的活动度。',
      '足球': '⚽ 足球热身。跑动量大，需充分激活腿部肌肉和心肺系统。注意动作质量，为高强度对抗做准备。',
      '乒乓球': '🏓 乒乓球热身。手腕、肩部和腰部是核心活动关节。热身帮助建立正确动作定型，提高反应速度。',
      '跳绳': '➰ 跳绳热身。手腕是跳绳发力的关键，踝关节和小腿是重点保护部位。充分热身预防跟腱损伤。',
      '跑步': '🏃 跑步热身。以动态拉伸为主，按关节-肌肉-心肺的顺序渐进激活。摆臂注意手肘90度、前后摆动。',
      '日常锻炼': '💪 热身准备。充分热身是预防运动损伤的第一道防线，也是提升运动表现的基础。请认真完成每一步。',
      '羽毛球': '🏸 羽毛球热身。肩部、手腕和核心旋转是重点。挥拍动作强调转肩发力和手腕控制，步法移动需要下肢充分激活。',
    },
    '16-adult': {
      '游泳': '🏊 游泳前热身。肩关节360度全范围激活，下肢肌肉充分预热。陆上热身完成后入水从慢游逐渐提速。',
      '攀岩': '🧗 攀岩热身。手指小肌群、腕关节、肩袖肌群是核心激活区域。每个动作注意神经肌肉控制和关节活动幅度。',
      '网球': '🎾 网球热身。肩袖肌群、核心旋转链、下肢移动能力需全面激活。挥拍强调转肩发力，注意腕关节保护。',
      '篮球': '🏀 篮球热身。膝关节、踝关节、腕关节为防护重点。跳跃和变向对下肢冲击大，充分热身降低ACL等损伤风险。',
      '足球': '⚽ 足球热身。下肢力量、耐力和爆发力是核心。充分激活腿部肌群和心肺系统，预防肌肉拉伤。',
      '乒乓球': '🏓 乒乓球热身。手腕灵活性、快速神经反应和下肢微调能力是重点。建立正确动作模式，提升运动表现。',
      '跳绳': '➰ 跳绳热身。手腕发力技巧、踝关节刚性支撑、小腿SSC（牵张缩短循环）是关键。充分热身预防跟腱病和足底筋膜炎。',
      '跑步': '🏃 跑步热身。以动态拉伸为主，避免静态拉伸。按关节活动→肌肉激活→心肺提升顺序渐进。重点防护小腿和踝关节。',
      '日常锻炼': '💪 运动前热身。按关节活动→肌肉激活→心肺提升的顺序渐进完成，有效预防运动损伤，提升训练质量。',
      '羽毛球': '🏸 羽毛球热身。肩袖肌群、手腕灵活性、核心旋转链和下肢敏捷性是重点激活区域。注意挥拍侧与非挥拍侧的对称热身。',
    },
  };

  // 尝试精确匹配年龄段
  if (messages[ageGroup]?.[sportName]) {
    return messages[ageGroup][sportName];
  }

  // Fallback: 取该年龄段的日常锻炼消息
  if (messages[ageGroup]?.['日常锻炼']) {
    return messages[ageGroup]['日常锻炼'];
  }

  // 最终 fallback
  return `💪 我是小酷教练！今天我们要为「${sportName}」做热身准备，认真完成每一个动作哦！准备好了吗？开始吧！`;
}

export default { getSports, getAgeGroups, getSportBySlug, getRoutine };
