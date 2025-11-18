import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Code2 } from 'lucide-react';

interface NotFoundProps {
  navigate: (page: string) => void;
}

export default function NotFound({ navigate }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl">
            <Code2 className="h-16 w-16 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-9xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        <h2 className="text-4xl mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          Oops! Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('home')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('home')}>
            <Search className="mr-2 h-5 w-5" />
            Browse Courses
          </Button>
        </div>

        <div className="mt-12 text-gray-500">
          <p>Need help? <button onClick={() => navigate('contact')} className="text-cyan-600 hover:text-cyan-700">Contact us</button></p>
        </div>
      </motion.div>
    </div>
  );
}
