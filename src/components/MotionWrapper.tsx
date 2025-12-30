"use client";

import { motion, AnimatePresence } from "framer-motion";

export const MotionWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export const FadeIn = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={className}
    >
        {children}
    </motion.div>
);

export const ScaleIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
        {children}
    </motion.div>
);
