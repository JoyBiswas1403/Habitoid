import { motion, AnimatePresence } from "framer-motion";
import { SlashCharacter } from "./SlashCharacter";
import { getSlashEvolution, SLASH_EVOLUTIONS } from "@/lib/gamification";
import { X, Sparkles } from "lucide-react";

interface LevelUpCelebrationProps {
    isOpen: boolean;
    onClose: () => void;
    newEvolution: typeof SLASH_EVOLUTIONS[number];
    totalPoints: number;
}

export function LevelUpCelebration({ isOpen, onClose, newEvolution, totalPoints }: LevelUpCelebrationProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.5, y: 50 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden"
                    style={{ backgroundColor: 'var(--card)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={20} />
                    </button>

                    {/* Sparkles */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-6 left-6"
                    >
                        <Sparkles size={24} style={{ color: '#f59e0b' }} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-10 right-12"
                    >
                        <Sparkles size={20} style={{ color: '#f59e0b' }} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="absolute bottom-16 left-8"
                    >
                        <Sparkles size={16} style={{ color: '#f59e0b' }} />
                    </motion.div>

                    {/* Evolution Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="text-6xl mb-4"
                    >
                        {newEvolution.icon}
                    </motion.div>

                    {/* Slash Character */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-4"
                    >
                        <SlashCharacter expression="happy" className="w-24 h-24 mx-auto" />
                    </motion.div>

                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-black mb-2">Level Up! 🎉</h2>
                        <p className="text-lg font-bold mb-1" style={{ color: 'var(--primary)' }}>
                            {newEvolution.name}
                        </p>
                        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                            {newEvolution.description}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Total Points: {totalPoints}
                        </p>
                    </motion.div>

                    {/* Continue Button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={onClose}
                        className="mt-6 px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                        Continue Crushing It!
                    </motion.button>

                    {/* Background glow */}
                    <div
                        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full opacity-30 blur-3xl"
                        style={{ backgroundColor: 'var(--primary)' }}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default LevelUpCelebration;
