-- Create Database Schema for TechHub Platform
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
  profile_image VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  verification_code VARCHAR(10),
  verification_expires_at TIMESTAMP,
  google_id VARCHAR(255),
  auth_provider VARCHAR(50) DEFAULT 'local'
);

CREATE TABLE instructor_profiles (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  job_title VARCHAR(100),
  linkedin VARCHAR(255),
  expertise TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  instructor_id INT REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(20) CHECK (
    level IN ('Beginner', 'Intermediate', 'Advanced')
  ),
  status VARCHAR(20) CHECK (status IN ('Published', 'Draft')) DEFAULT 'Draft',
  thumbnail VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_outcomes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_requirements (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_videos (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  video_order INT DEFAULT 1,
  title VARCHAR(200),
  video_url VARCHAR(300) NOT NULL,
  description TEXT,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_questions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_video_question FOREIGN KEY (video_id) REFERENCES course_videos(id) ON DELETE CASCADE
);

CREATE TABLE video_question_choices (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_question_choice FOREIGN KEY (question_id) REFERENCES video_questions(id) ON DELETE CASCADE
);

CREATE TABLE student_video_progress (
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_duration INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  PRIMARY KEY (student_id, video_id)
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  progress FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE video_notes (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INT NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  video_timestamp INT
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  submission_link VARCHAR(255),
  grade FLOAT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  course_id INT REFERENCES courses(id),
  certificate_link VARCHAR(255),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id),
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id),
  sender_id INT REFERENCES users(id),
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(150),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);