-- Add admin, instructor, and students
INSERT INTO users (full_name, email, password, role)
VALUES
('Mahmoud Raslan', 'mahmoud@techhub.com', '1234', 'instructor'),
('Toqa Ahmed', 'toqa@techhub.com', '1234', 'student'),
('Basmala Ali', 'basmala@techhub.com', '1234', 'student'),
('Admin User', 'admin@techhub.com', 'admin123', 'admin');

-- Add course
INSERT INTO courses (title, description, category, instructor_id, level, status)
VALUES
('Introduction to Web Development', 'Learn HTML, CSS, and JavaScript basics.', 'Web', 1, 'Beginner', 'Published');

-- Add enrollments
INSERT INTO enrollments (student_id, course_id, progress, completed)
VALUES
(2, 1, 60, false),
(3, 1, 100, true);

-- Add assignment
INSERT INTO assignments (course_id, title, description, deadline)
VALUES
(1, 'Build a simple web page', 'Use HTML and CSS to design your first page.', '2025-11-15');

-- Add submission
INSERT INTO submissions (assignment_id, student_id, submission_link, grade)
VALUES
(1, 2, 'https://github.com/toqa/web-page', 95.5);

-- Add certificate for completed student
INSERT INTO certificates (student_id, course_id, certificate_link)
VALUES
(3, 1, 'https://techhub.com/certificates/12345');

-- Add community and messages
INSERT INTO communities (course_id, name) VALUES (1, 'Web Development Community');

INSERT INTO messages (community_id, sender_id, message)
VALUES
(1, 2, 'I have a question about CSS selectors.'),
(1, 1, 'Sure, ask it here!');

-- Add notification
INSERT INTO notifications (user_id, title, message)
VALUES
(2, 'New Assignment', 'You have a new assignment in Web Development course.');
