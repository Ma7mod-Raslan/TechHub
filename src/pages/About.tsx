import { motion } from 'motion/react';
import { Target, Users, Award, TrendingUp, Heart, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';

interface AboutProps {
  navigate: (page: string) => void;
}

export default function About({ navigate }: AboutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar navigate={navigate} />

      <section className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl mb-6">About TechHub</h1>
            <p className="text-xl text-gray-600">
              We're on a mission to democratize tech education and empower the next generation of innovators and problem solvers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 2025, TechHub was born from a simple belief: quality tech education should be accessible to everyone, everywhere.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We started with a small team of passionate educators and developers who wanted to create something different - a platform that combines expert instruction, hands-on projects, and a supportive community.
              </p>
              <p className="text-lg text-gray-600">
                Today, we've grown to serve over 500,000 students worldwide, but our mission remains the same: to help you achieve your tech career goals.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1617153817979-283ffdcd52f5?w=800"
                alt="Our Team"
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To make world-class tech education accessible, engaging, and effective for learners at every stage of their journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Quality First',
                description: 'Every course is crafted by industry experts and reviewed for excellence.',
              },
              {
                icon: Heart,
                title: 'Student-Centered',
                description: 'We put your learning experience and success at the heart of everything we do.',
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'We constantly evolve our platform with the latest teaching methods and technologies.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Making a difference in tech education</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '500K+', label: 'Students Worldwide' },
              { icon: Award, value: '1,200+', label: 'Expert Courses' },
              { icon: TrendingUp, value: '95%', label: 'Success Rate' },
              { icon: Heart, value: '4.9/5', label: 'Average Rating' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl text-white mb-4">Join Our Growing Community</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start your learning journey today and become part of a global community of tech enthusiasts.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}
