import { motion } from 'motion/react';
import { GraduationCap, BookOpenCheck } from 'lucide-react';

interface RoleSwitchProps {
  selectedRole: 'student' | 'instructor';
  onRoleChange: (role: 'student' | 'instructor') => void;
}

export default function RoleSwitch({ selectedRole, onRoleChange }: RoleSwitchProps) {
  return (
    <div className="inline-flex items-center gap-2 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
      <motion.button
        onClick={() => onRoleChange('student')}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
          selectedRole === 'student'
            ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <GraduationCap className="h-5 w-5" />
        <span>Student</span>
      </motion.button>
      
      <motion.button
        onClick={() => onRoleChange('instructor')}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
          selectedRole === 'instructor'
            ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <BookOpenCheck className="h-5 w-5" />
        <span>Instructor</span>
      </motion.button>
    </div>
  );
}
