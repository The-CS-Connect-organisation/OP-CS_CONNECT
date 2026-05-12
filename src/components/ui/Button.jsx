import { motion } from 'framer-motion';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  danger: 'btn-danger',
  ghost: 'px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(0,0,0,0.05)] rounded-[var(--radius-md)] transition-all duration-200',
};

export const Button = ({ children, variant = 'primary', className = '', asChild = false, ...props }) => {
  if (asChild && children && typeof children === 'object' && children.props) {
    return (
      <motion.span
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`${variants[variant] || variants.primary} ${className} inline-flex items-center cursor-pointer`}
        onClick={children.props.onClick}
        {...props}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

