export default function HeroSection() {
  return (
    // ✅ Main hero section container
    <section className="flex flex-col lg:flex-row justify-between items-center px-10 lg:px-20 py-16 bg-blue-50 min-h-[80vh]">

      {/* =======================
          📝 LEFT SIDE: Text content
      ======================== */}
      <div className="max-w-xl text-center lg:text-left">
        {/* Tagline */}
        <p className="text-blue-600 font-medium mb-3">
          Welcome to the Future of Learning
        </p>

        {/* Main Heading */}
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
          Master New Skills with Expert-Led Courses
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 text-lg mb-8">
          Join thousands of learners and instructors building their careers
          through interactive, hands-on education.
        </p>

        {/* CTA (Call-To-Action) Buttons */}
        <div className="flex justify-center lg:justify-start space-x-4 mb-10">
          <button className="bg-blue-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition duration-200">
            Browse Courses
          </button>
          <button className="bg-white border border-gray-300 px-6 py-3 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200">
            Start Teaching
          </button>
        </div>

        {/* Stats Section */}
        <div className="flex justify-center lg:justify-start space-x-10 text-center">
          <div>
            <p className="text-3xl font-semibold text-gray-900">10K+</p>
            <p className="text-gray-500 text-sm">Active Students</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-gray-900">500+</p>
            <p className="text-gray-500 text-sm">Courses</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-gray-900">200+</p>
            <p className="text-gray-500 text-sm">Instructors</p>
          </div>
        </div>
      </div>

      {/* =======================
          💻 RIGHT SIDE: Hero Image
      ======================== */}
      <div className="mt-10 lg:mt-0">
        <img
          src="/hero-image.png" // 👈 Path from public folder
          alt="Students learning together"
          className="rounded-3xl shadow-lg w-[400px] lg:w-[480px] object-cover"
        />
      </div>
    </section>
  );
}
