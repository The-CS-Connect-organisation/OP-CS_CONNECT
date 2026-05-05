import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, accent = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`nova-card ${accent ? 'accent-line-top' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
