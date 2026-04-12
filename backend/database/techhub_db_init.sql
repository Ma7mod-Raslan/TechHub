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
  is_active BOOLEAN DEFAULT true,
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
  is_active BOOLEAN DEFAULT true,
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
  transcript_status VARCHAR(20) DEFAULT 'pending';
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
  passing_percentage INT DEFAULT 70,
  max_attempts INT,
  is_active BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignment_questions (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignment_options (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES assignment_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false
);

CREATE TABLE student_assignment_attempts (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  score INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  is_passed BOOLEAN NOT NULL,
  attempt_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_attempt_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INT REFERENCES student_assignment_attempts(id) ON DELETE CASCADE,
  question_id INT REFERENCES assignment_questions(id),
  selected_option_id INT REFERENCES assignment_options(id),
  is_correct BOOLEAN
);

CREATE INDEX idx_assignment_course ON assignments(course_id);
CREATE INDEX idx_questions_assignment ON assignment_questions(assignment_id);
CREATE INDEX idx_attempts_student ON student_assignment_attempts(student_id);

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
  instructor_id INT REFERENCES users(id).
  certificate_code VARCHAR(50) UNIQUE,
  course_id INT REFERENCES courses(id),
  certificate_link VARCHAR(255),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id INT REFERENCES course_videos(id) ON DELETE CASCADE,
  start_time FLOAT NOT NULL,
  duration FLOAT NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(150),
  message TEXT,
  type VARCHAR(50),
  reference_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  course_id INT UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  members_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_members (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (community_id, user_id)
);

CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_community ON community_posts(community_id);

CREATE TABLE community_replies (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_replies_post ON community_replies(post_id);

CREATE TABLE community_likes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  post_id INT REFERENCES community_posts(id) ON DELETE CASCADE,
  reply_id INT REFERENCES community_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL)
    OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX unique_post_like
ON community_likes(user_id, post_id)
WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX unique_reply_like
ON community_likes(user_id, reply_id)
WHERE reply_id IS NOT NULL;

CREATE TABLE community_reports (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  post_id INT REFERENCES community_posts(id) ON DELETE CASCADE,
  reply_id INT REFERENCES community_replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL)
    OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  )
);
