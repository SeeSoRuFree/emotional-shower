import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CloudAnimationProps {
  words: string[];
  onWordSelect?: (word: string) => void;
  weather: 'sunny' | 'cloudy' | 'rainy';
  className?: string;
}

interface FloatingWord {
  id: string;
  word: string;
  x: number;
  y: number;
  delay: number;
  selected: boolean;
}

const weatherWordConfigs = {
  sunny: {
    cloudColor: 'bg-headspace-pastel-yellow border-headspace-yellow/30',
    textColor: 'text-headspace-darkGray',
    selectedColor: 'bg-headspace-yellow border-headspace-yellow',
    shadowColor: 'shadow-soft',
  },
  cloudy: {
    cloudColor: 'bg-gray-100 border-gray-300',
    textColor: 'text-headspace-darkGray',
    selectedColor: 'bg-gray-200 border-gray-400',
    shadowColor: 'shadow-soft',
  },
  rainy: {
    cloudColor: 'bg-headspace-pastel-blue border-headspace-blue/30',
    textColor: 'text-headspace-darkGray',
    selectedColor: 'bg-headspace-blue/20 border-headspace-blue',
    shadowColor: 'shadow-soft',
  },
};

const CloudWord = ({ 
  word, 
  x, 
  y, 
  delay, 
  selected, 
  weather, 
  onSelect 
}: FloatingWord & { 
  weather: 'sunny' | 'cloudy' | 'rainy';
  onSelect: (word: string) => void;
}) => {
  const config = weatherWordConfigs[weather];
  
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        scale: 0.8,
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0,
        transition: { duration: 0.3 }
      }}
      transition={{
        duration: 0.5,
        delay: Math.min(delay, 0.3),
        ease: "easeOut",
      }}
      className={`absolute cursor-pointer select-none min-w-[44px] min-h-[44px] flex items-center justify-center z-10`}
      onClick={() => onSelect(word)}
      whileHover={selected ? { scale: 1.08 } : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ 
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'manipulation',
        willChange: 'transform'
      }}
    >
      <div className={`
        relative px-4 py-3 rounded-full border-2 min-h-[44px] flex items-center
        ${selected ? config.selectedColor : config.cloudColor}
        ${config.shadowColor} ${selected ? 'shadow-xl scale-105' : 'shadow-lg hover:shadow-xl'}
        backdrop-blur-sm transition-all duration-200
        ${selected ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
      `}>
        {/* Cloud-like background shape */}
        <div className="absolute inset-0 rounded-full opacity-50">
          <div className="absolute -left-2 top-1/2 w-4 h-4 rounded-full bg-inherit transform -translate-y-1/2" />
          <div className="absolute -right-2 top-1/2 w-4 h-4 rounded-full bg-inherit transform -translate-y-1/2" />
          <div className="absolute left-1/2 -top-2 w-4 h-4 rounded-full bg-inherit transform -translate-x-1/2" />
        </div>
        
        <span className={`relative z-10 font-medium ${config.textColor} flex items-center gap-1.5`}>
          {selected && <span className="text-green-600">✓</span>}
          {word}
        </span>
      </div>
    </motion.div>
  );
};

export default function CloudAnimation({ 
  words, 
  onWordSelect, 
  weather, 
  className = '' 
}: CloudAnimationProps) {
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Deterministic grid-based positioning with guaranteed spacing
  const generateGridPositions = (wordCount: number) => {
    console.log('Generating grid-based positions for', wordCount, 'words');
    
    if (wordCount === 0) return [];
    
    const positions: { x: number; y: number }[] = [];
    
    // Determine optimal grid dimensions based on word count
    let cols, rows;
    if (wordCount <= 4) {
      cols = 2; rows = 2; // 2x2 grid for 1-4 buttons
    } else if (wordCount <= 6) {
      cols = 3; rows = 2; // 3x2 grid for 5-6 buttons  
    } else if (wordCount <= 9) {
      cols = 3; rows = 3; // 3x3 grid for 7-9 buttons
    } else {
      cols = 4; rows = 3; // 4x3 grid for 10+ buttons
    }
    
    console.log(`Using ${cols}x${rows} grid for ${wordCount} words`);
    
    // Full screen utilization bounds
    const minX = 10, maxX = 90; // Use 10-90% width
    const minY = 15, maxY = 70; // Use 15-70% height (avoid bottom nav)
    
    const cellWidth = (maxX - minX) / cols;
    const cellHeight = (maxY - minY) / rows;
    
    // Generate positions with guaranteed spacing
    for (let i = 0; i < wordCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      // Center of current grid cell
      const cellCenterX = minX + (col + 0.5) * cellWidth;
      const cellCenterY = minY + (row + 0.5) * cellHeight;
      
      // Add small random offset within cell (max ±20% of cell size)
      const offsetX = (Math.random() - 0.5) * cellWidth * 0.4;
      const offsetY = (Math.random() - 0.5) * cellHeight * 0.4;
      
      const position = {
        x: Math.max(minX + 5, Math.min(maxX - 5, cellCenterX + offsetX)),
        y: Math.max(minY + 3, Math.min(maxY - 3, cellCenterY + offsetY))
      };
      
      positions.push(position);
      console.log(`Word ${i}: Grid[${col},${row}] -> (${position.x.toFixed(1)}%, ${position.y.toFixed(1)}%)`);
    }
    
    // Calculate average spacing for verification
    let totalDistance = 0;
    let pairCount = 0;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = Math.sqrt(
          Math.pow(positions[i].x - positions[j].x, 2) + 
          Math.pow(positions[i].y - positions[j].y, 2)
        );
        totalDistance += distance;
        pairCount++;
      }
    }
    
    const avgDistance = pairCount > 0 ? totalDistance / pairCount : 0;
    console.log(`Grid layout complete: Average distance between buttons: ${avgDistance.toFixed(1)}%`);
    
    return positions;
  };

  useEffect(() => {
    if (words.length === 0) {
      console.log('CloudAnimation: No words provided');
      return;
    }

    console.log('CloudAnimation: Setting up', words.length, 'words:', words);
    
    try {
      const positions = generateGridPositions(words.length);
      console.log('CloudAnimation: Generated grid positions:', positions);
      
      if (positions.length !== words.length) {
        console.error('CloudAnimation: Position count mismatch!', {
          words: words.length,
          positions: positions.length
        });
      }
      
      const newFloatingWords: FloatingWord[] = words.map((word, index) => {
        const position = positions[index];
        if (!position) {
          console.error('CloudAnimation: Missing position for word', index, word);
          // Fallback position
          return {
            id: `${word}-${index}`,
            word,
            x: 20 + (index % 3) * 30,
            y: 30 + Math.floor(index / 3) * 25,
            delay: index * 0.1,
            selected: false,
          };
        }
        
        return {
          id: `${word}-${index}`,
          word,
          x: position.x,
          y: position.y,
          delay: index * 0.1, // Faster appearance
          selected: false,
        };
      });

      console.log('CloudAnimation: Created floating words:', newFloatingWords);
      setFloatingWords(newFloatingWords);
      setSelectedWords([]);
    } catch (error) {
      console.error('CloudAnimation: Error in useEffect:', error);
      // Simple fallback layout
      const fallbackWords: FloatingWord[] = words.map((word, index) => ({
        id: `${word}-${index}`,
        word,
        x: 20 + (index % 3) * 30,
        y: 30 + Math.floor(index / 3) * 25,
        delay: index * 0.1,
        selected: false,
      }));
      setFloatingWords(fallbackWords);
      setSelectedWords([]);
    }
  }, [words]);

  const handleWordSelect = (word: string) => {
    setFloatingWords(prev => 
      prev.map(fw => 
        fw.word === word ? { ...fw, selected: !fw.selected } : fw
      )
    );
    
    // Toggle word in selected list
    setSelectedWords(prev => {
      const isSelected = prev.includes(word);
      if (isSelected) {
        return prev.filter(w => w !== word);
      } else {
        return [...prev, word];
      }
    });
    
    onWordSelect?.(word);
  };

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`} 
      style={{ 
        height: 'auto',
        minHeight: '400px',
        maxHeight: '60vh'
      }}
    >
      <AnimatePresence>
        {floatingWords.map((fw) => (
          <CloudWord
            key={fw.id}
            {...fw}
            weather={weather}
            onSelect={handleWordSelect}
          />
        ))}
      </AnimatePresence>
      
      
    </div>
  );
}