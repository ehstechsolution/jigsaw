import { motion } from "motion/react";
import { ReactionType } from "../types";

interface ReactionFlyoutProps {
  onSelectReaction: (reaction: ReactionType) => void;
  onMouseLeave?: () => void;
}

const REACTIONS: { type: ReactionType; label: string; emoji: string; color: string }[] = [
  { type: "like", label: "Curtir", emoji: "👍", color: "text-[#1877f2]" },
  { type: "love", label: "Amei", emoji: "❤️", color: "text-[#f33e5b]" },
  { type: "care", label: "Força", emoji: "🥰", color: "text-[#f5c33b]" },
  { type: "haha", label: "Haha", emoji: "😆", color: "text-[#f5c33b]" },
  { type: "wow", label: "Uau", emoji: "😮", color: "text-[#f5c33b]" },
  { type: "sad", label: "Triste", emoji: "😢", color: "text-[#f5c33b]" },
  { type: "angry", label: "Raiva", emoji: "😡", color: "text-[#e96630]" },
];

export default function ReactionFlyout({ onSelectReaction, onMouseLeave }: ReactionFlyoutProps) {
  return (
    <motion.div
      id="reaction-flyout-container"
      initial={{ opacity: 0, y: 15, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onMouseLeave={onMouseLeave}
      className="absolute -top-16 left-0 bg-white shadow-lg border border-gray-100 rounded-full px-2 py-1.5 flex items-center gap-1.5 z-50 select-none animate-none"
      style={{
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)",
      }}
    >
      {REACTIONS.map((rx, idx) => (
        <motion.button
          key={rx.type}
          id={`rx-btn-${rx.type}`}
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: idx * 0.03, type: "spring", stiffness: 120 }}
          whileHover={{ scale: 1.35, y: -8 }}
          type="button"
          onClick={() => onSelectReaction(rx.type)}
          className="relative group p-1 focus:outline-none cursor-pointer flex flex-col items-center"
        >
          <span className="text-2xl filter drop-shadow-sm transform active:scale-95">{rx.emoji}</span>
          <span className="absolute -top-8 px-1.5 py-0.5 bg-gray-900/90 text-white text-[10px] rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap font-medium">
            {rx.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
