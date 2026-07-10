import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 删除旧数据库（如果存在）
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  已删除旧数据库');
}

// 创建新数据库
const db = new Database(DB_PATH);
console.log('📦 创建新数据库:', DB_PATH);

// 启用 WAL 模式提升性能
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 读取并执行 schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);
console.log('✅ Schema 已创建');

// 读取并执行 seed data
const seedPath = path.join(__dirname, 'seed.sql');
const seed = fs.readFileSync(seedPath, 'utf-8');
db.exec(seed);
console.log('✅ 种子数据已导入');

// 验证数据
const sportCount = db.prepare('SELECT COUNT(*) as count FROM sports').get() as any;
const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercises').get() as any;
const planCount = db.prepare('SELECT COUNT(*) as count FROM warmup_plans').get() as any;
const ageCount = db.prepare('SELECT COUNT(*) as count FROM age_language').get() as any;

console.log('\n📊 数据统计:');
console.log(`   运动项目: ${sportCount.count} 个`);
console.log(`   动作库: ${exerciseCount.count} 个`);
console.log(`   热身方案记录: ${planCount.count} 条`);
console.log(`   年龄段文案: ${ageCount.count} 条`);

db.close();
console.log('\n🎉 数据库初始化完成！');
