
import React from "react";
import { motion } from "framer-motion";

interface AnimatedLevelUpProps {
  show: boolean;
}

export const AnimatedLevelUp = React.memo(({ show }: AnimatedLevelUpProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${!show && 'pointer-events-none'}`}
    >
      {show && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4"
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 20px 0px rgba(168, 85, 247, 0.5)",
                "0 0 30px 5px rgba(168, 85, 247, 0.8)",
                "0 0 20px 0px rgba(168, 85, 247, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: 1 }}
          >
            <span className="text-white font-bold text-4xl">
              +1
            </span>
          </motion.div>
          
          <motion.h2
            className="text-white text-3xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Level Up!
          </motion.h2>
          
          <motion.p
            className="text-white/80 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            First workout of the day
          </motion.p>
          
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm text-white">
              +50 XP Bonus
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
});

AnimatedLevelUp.displayName = 'AnimatedLevelUp';
