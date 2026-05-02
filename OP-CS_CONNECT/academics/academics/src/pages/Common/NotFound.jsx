import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound = ({ user }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Big 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <h1 className="text-[120px] font-black leading-none tracking-tighter text-gray-900 select-none">
            4
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">0</span>
            4
          </h1>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6"
        >
          <Search size={28} className="text-gray-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
          >
            <Home size={16} />
            {user ? 'Go to Dashboard' : 'Go to Login'}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[10px] text-gray-300 mt-10 uppercase tracking-widest font-semibold"
        >
          Cornerstone SchoolSync
        </motion.p>
      </motion.div>
    </div>
  );
};
