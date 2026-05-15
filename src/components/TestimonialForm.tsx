import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { submitFeedback } from "../pages/student/config/studentApi";

interface TestimonialFormProps {
  onClose?: () => void;
  studentName?: string;
  studentRole?: string;
}

export default function TestimonialForm({ onClose, studentName = 'Anonymous', studentRole = 'Student' }: TestimonialFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [testimonialText, setTestimonialText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (testimonialText.trim().length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    await submitFeedback({
      stars_num: rating,
      comment: testimonialText.trim()
    });

    setIsSubmitting(false);
    toast.success('Thank you for your feedback! Your testimonial has been submitted.');

    // Reset form
    setRating(0);
    setTestimonialText('');

    // Close modal if callback provided
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-violet-600" />
              Share Your Experience
            </CardTitle>
            {/* {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )} */}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Help other students by sharing your learning journey with TechHub
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm mb-2">Your Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 mt-2"
                >
                  {rating === 5 && '⭐ Excellent!'}
                  {rating === 4 && '👍 Great!'}
                  {rating === 3 && '👌 Good'}
                  {rating === 2 && '😐 Fair'}
                  {rating === 1 && '👎 Poor'}
                </motion.p>
              )}
            </div>

            {/* Testimonial Text */}
            <div>
              <label htmlFor="testimonial" className="block text-sm mb-2">
                Your Testimonial *
              </label>
              <Textarea
                id="testimonial"
                placeholder="Share your experience with TechHub. What did you learn? How has it helped your career?"
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                rows={5}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {testimonialText.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Testimonial
                  </>
                )}
              </Button>
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
