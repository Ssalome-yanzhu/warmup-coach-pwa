import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, Flame, Snowflake, MessageCircleHeart } from 'lucide-react';
import type { Sport, AgeGroup, RoutineResponse, RoutineType } from './types';
import { SportSelect } from './components/SportSelect';
import { RoutineCard } from './components/RoutineCard';
import { VideoPlayer } from './components/VideoPlayer';
import { getRulesSummary } from './executionRules';
import heroImage from './assets/images/kids_sports_header_1781415711864.jpg';
import cartoonKidImage from './assets/images/cartoon_kid_stretching_1781416479521.jpg';

export default function App() {
  // 下拉选项数据
  const [sports, setSports] = useState<Sport[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);

  // 用户选择
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedAge, setSelectedAge] = useState('');

  // 加载/错误状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // 方案数据
  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const [activeTab, setActiveTab] = useState<RoutineType>('warmup');

  // 跟练状态
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [allDone, setAllDone] = useState(false);

  // 页面加载时获取下拉选项
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [sportsRes, ageRes] = await Promise.all([
          fetch('/api/sports'),
          fetch('/api/age-groups'),
        ]);
        const sportsData = await sportsRes.json();
        const ageData = await ageRes.json();
        setSports(sportsData);
        setAgeGroups(ageData);
      } catch {
        setError('无法加载选项，请检查网络后刷新页面');
      } finally {
        setInitialLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // 获取方案
  const fetchRoutine = useCallback(
    async (sportSlug: string, age: string, type: RoutineType) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/routine?sport=${sportSlug}&age=${age}&type=${type}`
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || '获取方案失败');
        }
        const data = await res.json();
        setRoutine(data);
        setCurrentStepIndex(0);
        setAllDone(false);
      } catch (err: any) {
        setError(err.message || '获取方案失败，请稍后再试');
        setRoutine(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 提交选择
  const handleSubmit = useCallback(() => {
    if (!selectedSport || !selectedAge) return;
    setActiveTab('warmup');
    fetchRoutine(selectedSport, selectedAge, 'warmup');
  }, [selectedSport, selectedAge, fetchRoutine]);

  // 切换热身/拉伸
  const handleTabChange = useCallback(
    (type: RoutineType) => {
      if (type === activeTab) return;
      setActiveTab(type);
      if (selectedSport && selectedAge) {
        fetchRoutine(selectedSport, selectedAge, type);
      }
    },
    [activeTab, selectedSport, selectedAge, fetchRoutine]
  );

  // 步骤操作
  const handleStepClick = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setAllDone(false);
  }, []);

  const handleStepComplete = useCallback(() => {
    setAllDone(true);
  }, []);

  const handleStepChange = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setAllDone(false);
  }, []);

  const currentSport = sports.find((s) => s.slug === selectedSport);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-8 selection:bg-orange-200 flex flex-col">
      {/* ===== Hero Banner ===== */}
      <div className="relative w-full h-[200px] md:h-[280px] overflow-hidden bg-slate-200 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/90 z-10" />
        <img
          src={heroImage}
          alt="Happy kids doing sports"
          className="w-full h-full object-cover object-center absolute inset-0"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end z-20 pb-6 px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm mb-2">
              热身魔法师 🌟
            </h1>
            <p className="text-sm md:text-base font-medium text-slate-700 max-w-xl mx-auto drop-shadow-sm">
              选运动、选年龄，获取专属热身和拉伸指导，跟着视频一起练！
            </p>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-3 right-3 md:bottom-5 md:right-6 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-xs font-bold text-orange-500">
            <Sparkles size={14} />
            {currentSport ? `${currentSport.icon} ${currentSport.name}` : '智能教练'}
          </span>
        </motion.div>
      </div>

      {/* ===== 主体 ===== */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-3 relative z-20 flex-1 flex flex-col">
        {/* ===== 选择卡片 ===== */}
        <motion.div
          className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 p-4 md:p-5 -mt-5 border border-slate-100 shrink-0"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {initialLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-orange-400" size={24} />
              <span className="ml-3 text-slate-500 font-medium">加载中...</span>
            </div>
          ) : (
            <SportSelect
              sports={sports}
              ageGroups={ageGroups}
              selectedSport={selectedSport}
              selectedAge={selectedAge}
              onSportChange={setSelectedSport}
              onAgeChange={setSelectedAge}
              onSubmit={handleSubmit}
              loading={loading}
              disabled={false}
            />
          )}
        </motion.div>

        {/* ===== 错误提示 ===== */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-red-50 text-red-600 border-2 border-red-200 p-3 rounded-2xl text-center font-bold text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* ===== 加载状态 ===== */}
        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute w-16 h-16 rounded-full border-4 border-transparent border-t-orange-400 opacity-50"
              />
              <span className="text-3xl relative z-10 animate-bounce">🏃</span>
            </div>
            <p className="text-lg font-bold text-slate-700 animate-pulse text-center">
              小酷教练正在准备 {currentSport?.icon} {currentSport?.name} 的方案...
            </p>
          </div>
        )}

        {/* ===== 结果展示区 ===== */}
        {routine && !loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4 flex-1 flex flex-col"
          >
            {/* 第一行：Toggle + Coach Message */}
            <div className="flex flex-col md:flex-row items-stretch gap-3 mb-4">
              {/* Warmup/Stretch Toggle */}
              <div className="relative flex bg-slate-100 p-1 rounded-full w-full md:w-56 flex-shrink-0 shadow-inner self-start">
                <motion.div
                  className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white rounded-full shadow-md"
                  animate={{ left: activeTab === 'warmup' ? '0.25rem' : '50%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => handleTabChange('warmup')}
                  className={`relative z-10 w-1/2 py-2.5 rounded-full font-bold text-sm transition-colors flex justify-center items-center gap-1.5 ${
                    activeTab === 'warmup' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🔥 热身
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('stretch')}
                  className={`relative z-10 w-1/2 py-2.5 rounded-full font-bold text-sm transition-colors flex justify-center items-center gap-1.5 ${
                    activeTab === 'stretch' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ❄️ 拉伸
                </button>
              </div>

              {/* Coach Dialog */}
              <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3 flex gap-3 items-center shadow-sm">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border-2 border-indigo-100 flex-shrink-0">
                  🦁
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1 mb-0.5">
                    <MessageCircleHeart className="text-indigo-500" size={14} />
                    小酷教练说：
                  </h3>
                  <p className="text-xs text-indigo-800 font-medium leading-snug line-clamp-3">
                    {routine.coachMessage}
                  </p>
                </div>
                {/* 卡通图片 */}
                <img
                  src={cartoonKidImage}
                  alt="Cartoon kid"
                  className="hidden sm:block w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
              </div>
            </div>

            {/* ===== 第二行：视频 + 动作列表（响应式） ===== */}
            {/* 竖屏(< lg): 视频在上，列表在下 */}
            {/* 横屏(≥ lg): 视频在左，列表在右 */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              {/* 视频区 */}
              <div className="w-full lg:w-[55%] flex-shrink-0">
                {allDone ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center aspect-video shadow-sm"
                  >
                    <span className="text-6xl mb-4">🎉</span>
                    <h2 className="text-2xl font-extrabold text-green-700 mb-2">全部完成！</h2>
                    <p className="text-green-600 font-medium">
                      太棒了！你完成了所有{activeTab === 'warmup' ? '热身' : '拉伸'}动作！
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStepIndex(0);
                        setAllDone(false);
                      }}
                      className="mt-4 px-6 py-2.5 bg-green-500 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      再来一次
                    </button>
                  </motion.div>
                ) : (
                  <VideoPlayer
                    steps={routine.steps}
                    currentStepIndex={currentStepIndex}
                    onStepComplete={handleStepComplete}
                    onStepChange={handleStepChange}
                  />
                )}
              </div>

              {/* 动作列表 */}
              <div className="w-full lg:w-[45%] flex-1 min-h-0">
                {/* 执行规则说明 */}
                {(() => {
                  const rules = getRulesSummary(routine.steps.map(s => s.executionType));
                  return rules.length > 0 ? (
                    <div className="mb-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                        📋 动作执行规则
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rules.map(r => (
                          <span key={r.type} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">
                            {r.label}：<strong className="text-orange-500">{r.display}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-3 shadow-sm border border-white/50 h-full max-h-[500px] lg:max-h-none overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-2 px-1 flex-shrink-0">
                    <div className="p-1.5 rounded-lg bg-orange-500 text-white shadow-sm">
                      {activeTab === 'warmup' ? (
                        <Flame size={16} className="fill-white" />
                      ) : (
                        <Snowflake size={16} className="fill-white" />
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-orange-600">
                      {activeTab === 'warmup' ? '热身动作列表' : '拉伸动作列表'}
                    </h2>
                    <span className="ml-auto text-xs text-slate-400 font-medium">
                      共 {routine.steps.length} 个动作
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1">
                    <RoutineCard
                      steps={routine.steps}
                      currentStepIndex={allDone ? routine.steps.length : currentStepIndex}
                      onStepClick={handleStepClick}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== 空状态：未选择时 ===== */}
        {!routine && !loading && !error && !initialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🏋️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-500 mb-2">准备好了吗？</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              在上方选择运动项目和年龄段，小酷教练就为你准备专属的热身方案！
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
