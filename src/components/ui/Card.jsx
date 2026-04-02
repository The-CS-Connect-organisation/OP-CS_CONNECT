import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, ...props }) => (
  <motion.div
    {...(hover ? { whileHover: { y: -2, transition: { duration: 0.2 } } } : {})}
    className={`glass-card p-6 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);
