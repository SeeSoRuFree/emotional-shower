import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, Heart, Award, Clock, Music, 
  ChevronRight, LogOut, Bell, Palette, Volume2,
  Sparkles, MessageCircle, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { useEmotionStore } from '@/store/emotionStore';

// MBTI 목록
const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// 대화톤 옵션
const toneOptions = [
  { id: 'empathetic', name: '공감형', emoji: '🤗', description: '따뜻하고 이해심 많은' },
  { id: 'rational', name: '이성형', emoji: '🧠', description: '논리적이고 분석적인' },
  { id: 'encouraging', name: '격려형', emoji: '💪', description: '긍정적이고 동기부여하는' },
  { id: 'neutral', name: '중립형', emoji: '⚖️', description: '균형잡힌 객관적인' },
];

export default function Profile() {
  const navigate = useNavigate();
  const emotions = useEmotionStore((state) => state.emotions);
  const [showSettings, setShowSettings] = useState(false);
  
  // 로컬 스토리지에서 사용자 설정 가져오기
  const [userMBTI, setUserMBTI] = useState(localStorage.getItem('userMBTI') || 'INFP');
  const [selectedTone, setSelectedTone] = useState(localStorage.getItem('chatTone') || 'empathetic');
  const [notificationTime, setNotificationTime] = useState(localStorage.getItem('notificationTime') || '21:00');

  // 통계 계산
  const totalEmotions = emotions.length;
  const consecutiveDays = calculateConsecutiveDays();
  const mostFrequentEmotion = getMostFrequentEmotion();

  function calculateConsecutiveDays() {
    if (emotions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const hasEmotion = emotions.some(e => {
        const eDate = new Date(e.timestamp);
        eDate.setHours(0, 0, 0, 0);
        return eDate.getTime() === currentDate.getTime();
      });
      
      if (!hasEmotion) break;
      count++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return count;
  }

  function getMostFrequentEmotion() {
    if (emotions.length === 0) return null;
    
    const counts = { positive: 0, negative: 0, helping: 0 };
    emotions.forEach(e => counts[e.type]++);
    
    const max = Math.max(counts.positive, counts.negative, counts.helping);
    if (counts.positive === max) return { type: 'positive', emoji: '☀️', name: '행복해요' };
    if (counts.negative === max) return { type: 'negative', emoji: '💗', name: '도움이 필요해요' };
    return { type: 'helping', emoji: '💙', name: '평온해요' };
  }

  const handleSaveMBTI = (mbti: string) => {
    setUserMBTI(mbti);
    localStorage.setItem('userMBTI', mbti);
  };

  const handleSaveTone = (tone: string) => {
    setSelectedTone(tone);
    localStorage.setItem('chatTone', tone);
  };

  const handleSaveNotificationTime = (time: string) => {
    setNotificationTime(time);
    localStorage.setItem('notificationTime', time);
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  // 설정 화면
  if (showSettings) {
    return (
      <div className="min-h-screen bg-headspace-beige">
        {/* Settings Header */}
        <div className="bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="text-headspace-textMuted"
            >
              ← 돌아가기
            </button>
            <h1 className="text-xl font-bold text-headspace-darkGray">설정</h1>
          </div>
        </div>

        <div className="p-6 pb-32">
          {/* MBTI 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-soft mb-6"
          >
            <h3 className="font-bold text-headspace-darkGray mb-4">MBTI 유형</h3>
            <div className="grid grid-cols-4 gap-2">
              {mbtiTypes.map(mbti => (
                <button
                  key={mbti}
                  onClick={() => handleSaveMBTI(mbti)}
                  className={`
                    py-2 rounded-2xl text-sm font-medium transition-all
                    ${userMBTI === mbti 
                      ? 'bg-headspace-blue text-white' 
                      : 'bg-headspace-pastel-blue text-headspace-darkGray hover:bg-headspace-blue hover:text-white'
                    }
                  `}
                >
                  {mbti}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 대화톤 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-soft mb-6"
          >
            <h3 className="font-bold text-headspace-darkGray mb-4">AI 대화톤</h3>
            <div className="space-y-3">
              {toneOptions.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => handleSaveTone(tone.id)}
                  className={`
                    w-full p-4 rounded-2xl flex items-center gap-3 transition-all
                    ${selectedTone === tone.id 
                      ? 'bg-headspace-pastel-purple border-2 border-headspace-purple' 
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-2xl">{tone.emoji}</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-headspace-darkGray">{tone.name}</div>
                    <div className="text-xs text-headspace-textMuted">{tone.description}</div>
                  </div>
                  {selectedTone === tone.id && (
                    <div className="w-5 h-5 bg-headspace-purple rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 알림 설정 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-soft mb-6"
          >
            <h3 className="font-bold text-headspace-darkGray mb-4">알림 시간</h3>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-headspace-yellow" />
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => handleSaveNotificationTime(e.target.value)}
                className="flex-1 px-4 py-2 rounded-2xl border border-gray-200 focus:border-headspace-blue focus:outline-none"
              />
            </div>
            <p className="text-xs text-headspace-textMuted mt-2">
              매일 이 시간에 감정 체크인 알림을 보내드려요
            </p>
          </motion.div>

          {/* 로그아웃 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 py-4 rounded-3xl font-medium hover:bg-red-100 transition-colors"
            >
              로그아웃
            </button>
          </motion.div>
        </div>

        <ResponsiveNav />
      </div>
    );
  }

  // 메인 프로필 화면
  return (
    <div className="min-h-screen bg-headspace-beige">
      {/* Header */}
      <div className="bg-gradient-to-b from-headspace-pastel-blue to-white p-6 pb-12">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-headspace-darkGray">
            마이 샤워실 🚿
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white rounded-full shadow-soft"
          >
            <Settings className="w-5 h-5 text-headspace-darkGray" />
          </button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-headspace-yellow to-headspace-pink rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-headspace-darkGray">
                {userMBTI} 탐험가
              </h2>
              <p className="text-headspace-textMuted text-sm">
                {totalEmotions}번의 감정 기록
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-headspace-pastel-yellow rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-lg font-bold text-headspace-darkGray">{consecutiveDays}</div>
              <div className="text-xs text-headspace-textMuted">연속 기록</div>
            </div>
            <div className="bg-headspace-pastel-pink rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{mostFrequentEmotion?.emoji || '💫'}</div>
              <div className="text-lg font-bold text-headspace-darkGray">
                {mostFrequentEmotion?.name || '-'}
              </div>
              <div className="text-xs text-headspace-textMuted">주요 감정</div>
            </div>
            <div className="bg-headspace-pastel-green rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-lg font-bold text-headspace-darkGray">레벨 {Math.floor(totalEmotions / 10) + 1}</div>
              <div className="text-xs text-headspace-textMuted">성장 단계</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 pb-32 -mt-6">
        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-soft overflow-hidden"
        >
          <button
            onClick={() => navigate('/chat')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-headspace-blue" />
              <span className="text-headspace-darkGray">대화 히스토리</span>
            </div>
            <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
          </button>
          
          <div className="border-t border-gray-100" />
          
          <button
            onClick={() => navigate('/history')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-headspace-green" />
              <span className="text-headspace-darkGray">감정 캘린더</span>
            </div>
            <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
          </button>
          
          <div className="border-t border-gray-100" />
          
          <button
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-headspace-purple" />
              <span className="text-headspace-darkGray">저장한 음악</span>
            </div>
            <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
          </button>
          
          <div className="border-t border-gray-100" />
          
          <button
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-headspace-yellow" />
              <span className="text-headspace-darkGray">획득한 배지</span>
            </div>
            <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
          </button>
        </motion.div>

        {/* Achievement Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gradient-to-r from-headspace-pastel-purple to-headspace-pastel-blue rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-headspace-purple" />
            <h3 className="font-bold text-headspace-darkGray">이번 주 목표</h3>
          </div>
          <p className="text-headspace-darkGray mb-4">
            매일 한 번 이상 감정 기록하기
          </p>
          <div className="bg-white/50 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((consecutiveDays / 7) * 100, 100)}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-full bg-gradient-to-r from-headspace-purple to-headspace-blue"
            />
          </div>
          <p className="text-xs text-headspace-textMuted mt-2">
            {consecutiveDays}/7일 달성
          </p>
        </motion.div>

        {/* Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-white rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-headspace-pink" />
            <h3 className="font-bold text-headspace-darkGray">오늘의 자기친절 팁</h3>
          </div>
          <p className="text-headspace-darkGray italic">
            "실수를 했을 때, 친한 친구에게 하듯 자신에게도 다정하게 말해보세요."
          </p>
        </motion.div>
      </div>

      <ResponsiveNav />
    </div>
  );
}