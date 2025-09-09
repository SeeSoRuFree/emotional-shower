import { useEmotionStore, getTodayEmotions, getEmotionStats } from '@/store/emotionStore';
import { Card } from '@/components/ui/card';

export default function EmotionTimeline() {
  const allEmotions = useEmotionStore((state) => state.emotions);
  const emotions = getTodayEmotions(allEmotions);
  const stats = getEmotionStats(allEmotions);

  const getEmotionEmoji = (type: string) => {
    switch (type) {
      case 'positive': return '😊';
      case 'negative': return '😢';
      case 'helping': return '🤝';
      default: return '😐';
    }
  };

  const getEmotionColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-joy';
      case 'negative': return 'bg-sadness';
      case 'helping': return 'bg-helping';
      default: return 'bg-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">오늘의 감정 기록</h3>
        <p className="text-sm text-gray-600">총 {stats.total}회 기록</p>
      </div>

      {/* 감정 타임라인 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {emotions.length > 0 ? (
          emotions.map((emotion) => (
            <div
              key={emotion.id}
              className={`flex-shrink-0 w-12 h-12 rounded-full ${getEmotionColor(emotion.type)} flex items-center justify-center text-xl`}
            >
              {getEmotionEmoji(emotion.type)}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">아직 기록이 없어요. 감정을 기록해보세요!</p>
        )}
      </div>

      {/* 감정 통계 */}
      {stats.total > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl">😊</div>
              <p className="text-sm text-gray-600">{stats.positive}</p>
            </div>
            <div>
              <div className="text-2xl">😢</div>
              <p className="text-sm text-gray-600">{stats.negative}</p>
            </div>
            <div>
              <div className="text-2xl">🤝</div>
              <p className="text-sm text-gray-600">{stats.helping}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}