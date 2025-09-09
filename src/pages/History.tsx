import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { useEmotionStore } from '@/store/emotionStore';

// 월 이름
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 감정 색상 매핑
const emotionColors = {
  positive: '#FFCE00', // Headspace yellow
  negative: '#FFA1CC', // Headspace pink
  helping: '#8CE1FF'  // Headspace blue
};

// Mock 키워드 데이터 (실제로는 AI 대화에서 추출)
const mockKeywords = [
  { word: '감사', count: 12, emotion: 'positive' },
  { word: '피곤', count: 8, emotion: 'negative' },
  { word: '도움', count: 6, emotion: 'helping' },
  { word: '행복', count: 5, emotion: 'positive' },
  { word: '불안', count: 4, emotion: 'negative' },
];

export default function History() {
  const emotions = useEmotionStore((state) => state.emotions);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 현재 월의 감정 데이터 계산
  const monthlyEmotions = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return emotions.filter(emotion => {
      const emotionDate = new Date(emotion.timestamp);
      return emotionDate.getFullYear() === year && emotionDate.getMonth() === month;
    });
  }, [emotions, currentDate]);

  // 날짜별 감정 집계
  const dailyEmotionMap = useMemo(() => {
    const map = new Map<string, { positive: number; negative: number; helping: number }>();
    
    monthlyEmotions.forEach(emotion => {
      const dateKey = new Date(emotion.timestamp).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, { positive: 0, negative: 0, helping: 0 });
      }
      const stats = map.get(dateKey)!;
      stats[emotion.type]++;
    });
    
    return map;
  }, [monthlyEmotions]);

  // 전체 통계
  const totalStats = useMemo(() => {
    const stats = { positive: 0, negative: 0, helping: 0, total: 0 };
    emotions.forEach(emotion => {
      stats[emotion.type]++;
      stats.total++;
    });
    return stats;
  }, [emotions]);

  // 최근 7일 통계
  const weeklyStats = useMemo(() => {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEmotions = emotions.filter(emotion => {
        const emotionDate = new Date(emotion.timestamp);
        emotionDate.setHours(0, 0, 0, 0);
        return emotionDate.getTime() === date.getTime();
      });
      
      weekData.push({
        day: weekDays[date.getDay()],
        date: date.getDate(),
        positive: dayEmotions.filter(e => e.type === 'positive').length,
        negative: dayEmotions.filter(e => e.type === 'negative').length,
        helping: dayEmotions.filter(e => e.type === 'helping').length,
      });
    }
    
    return weekData;
  }, [emotions]);

  // 캘린더 생성
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // 이전 달 날짜들
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // 현재 달 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = generateCalendar();

  // 월 이동
  const changeMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // 날짜별 주요 감정 색상 결정
  const getDayColor = (date: Date) => {
    const dateKey = date.toDateString();
    const dayStats = dailyEmotionMap.get(dateKey);
    
    if (!dayStats) return null;
    
    const { positive, negative, helping } = dayStats;
    const total = positive + negative + helping;
    
    if (total === 0) return null;
    
    // 가장 많은 감정 타입의 색상 반환
    if (positive >= negative && positive >= helping) return emotionColors.positive;
    if (negative >= positive && negative >= helping) return emotionColors.negative;
    return emotionColors.helping;
  };

  // 선택된 날짜의 감정들
  const selectedDateEmotions = selectedDate 
    ? emotions.filter(emotion => {
        const emotionDate = new Date(emotion.timestamp);
        emotionDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return emotionDate.getTime() === selectedDate.getTime();
      })
    : [];

  return (
    <div className="min-h-screen bg-headspace-beige">
      {/* Header */}
      <div className="bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-headspace-darkGray text-center">
          감정 여행 기록 ✨
        </h1>
        <p className="text-headspace-textMuted text-center mt-1">
          나의 감정 패턴을 이해해보세요
        </p>
      </div>

      <div className="p-6 pb-32">
        {/* 월간 캘린더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-soft mb-6"
        >
          {/* 캘린더 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-headspace-pastel-blue rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-headspace-darkGray" />
            </button>
            
            <h2 className="text-lg font-bold text-headspace-darkGray">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-headspace-pastel-blue rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-headspace-darkGray" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-headspace-textMuted">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} />;
              }
              
              const dayColor = getDayColor(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <motion.button
                  key={date.toISOString()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    aspect-square rounded-2xl flex items-center justify-center text-sm
                    ${isSelected ? 'ring-2 ring-headspace-blue' : ''}
                    ${isToday ? 'font-bold' : ''}
                    ${dayColor ? 'text-white' : 'text-headspace-darkGray'}
                    transition-all
                  `}
                  style={{
                    backgroundColor: dayColor || (isToday ? '#F0F0F0' : 'transparent')
                  }}
                >
                  {date.getDate()}
                </motion.button>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotionColors.positive }} />
              <span className="text-xs text-headspace-textMuted">행복</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotionColors.negative }} />
              <span className="text-xs text-headspace-textMuted">도움필요</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotionColors.helping }} />
              <span className="text-xs text-headspace-textMuted">평온</span>
            </div>
          </div>
        </motion.div>

        {/* 선택된 날짜의 감정들 */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-soft mb-6"
          >
            <h3 className="font-bold text-headspace-darkGray mb-3">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일의 감정
            </h3>
            {selectedDateEmotions.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEmotions.map((emotion, index) => (
                  <div key={emotion.id} className="flex items-center gap-3">
                    <span className="text-xs text-headspace-textMuted">
                      {new Date(emotion.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: emotionColors[emotion.type] }}
                    >
                      {emotion.type === 'positive' ? '행복해요' : emotion.type === 'negative' ? '도움이 필요해요' : '평온해요'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-headspace-textMuted text-sm">이날은 기록된 감정이 없어요</p>
            )}
          </motion.div>
        )}

        {/* 주간 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-soft mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-headspace-green" />
            <h3 className="font-bold text-headspace-darkGray">최근 7일 감정 변화</h3>
          </div>
          
          <div className="flex justify-between items-end h-32">
            {weeklyStats.map((day, index) => {
              const total = day.positive + day.negative + day.helping;
              const maxHeight = 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full flex flex-col items-center">
                    {total > 0 && (
                      <div className="w-8 flex flex-col rounded-t-2xl overflow-hidden">
                        {day.helping > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.helping / Math.max(...weeklyStats.map(d => d.positive + d.negative + d.helping))) * maxHeight}px` }}
                            transition={{ delay: index * 0.05 }}
                            style={{ backgroundColor: emotionColors.helping }}
                          />
                        )}
                        {day.negative > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.negative / Math.max(...weeklyStats.map(d => d.positive + d.negative + d.helping))) * maxHeight}px` }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                            style={{ backgroundColor: emotionColors.negative }}
                          />
                        )}
                        {day.positive > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.positive / Math.max(...weeklyStats.map(d => d.positive + d.negative + d.helping))) * maxHeight}px` }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                            style={{ backgroundColor: emotionColors.positive }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-headspace-textMuted">{day.day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 전체 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-headspace-pastel-yellow to-headspace-pastel-pink rounded-3xl p-6 shadow-soft mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-headspace-purple" />
            <h3 className="font-bold text-headspace-darkGray">전체 감정 통계</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-headspace-yellow">{totalStats.positive}</div>
              <div className="text-xs text-headspace-textMuted">행복해요</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-headspace-pink">{totalStats.negative}</div>
              <div className="text-xs text-headspace-textMuted">도움필요</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-headspace-blue">{totalStats.helping}</div>
              <div className="text-xs text-headspace-textMuted">평온해요</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-center text-headspace-darkGray">
              총 <span className="font-bold">{totalStats.total}번</span>의 감정을 기록했어요!
            </p>
          </div>
        </motion.div>

        {/* 자주 나온 키워드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-headspace-purple" />
            <h3 className="font-bold text-headspace-darkGray">자주 나온 키워드</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {mockKeywords.map((keyword, index) => (
              <motion.div
                key={keyword.word}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: keyword.emotion === 'positive' 
                    ? '#FFF9E6' 
                    : keyword.emotion === 'negative'
                    ? '#FFE6F1'
                    : '#E6F5FF',
                  color: emotionColors[keyword.emotion as keyof typeof emotionColors]
                }}
              >
                {keyword.word} ({keyword.count})
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <ResponsiveNav />
    </div>
  );
}