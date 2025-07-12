/*
  # Initial Schema Setup for StackIt Q&A Platform

  1. New Tables
    - `users` - User profiles with authentication data
      - `id` (uuid, primary key) - matches auth.users id
      - `username` (text, unique) - display name
      - `email` (text, unique) - user email
      - `avatar_url` (text, nullable) - profile picture URL
      - `role` (enum) - user role (guest, user, admin)
      - `reputation` (integer) - user reputation score
      - `badge` (text) - current badge name
      - `questions_answered` (integer) - count of answers given
      - `created_at` (timestamptz) - account creation time
      - `updated_at` (timestamptz) - last profile update

    - `questions` - User questions
      - `id` (uuid, primary key)
      - `title` (text) - question title
      - `description` (text) - question content
      - `tags` (text array) - question tags
      - `author_id` (uuid) - foreign key to users
      - `votes` (integer) - vote score
      - `views` (integer) - view count
      - `accepted_answer_id` (uuid, nullable) - accepted answer reference
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `answers` - Question answers
      - `id` (uuid, primary key)
      - `content` (text) - answer content
      - `question_id` (uuid) - foreign key to questions
      - `author_id` (text) - user id or 'ai-assistant'
      - `votes` (integer) - vote score
      - `is_accepted` (boolean) - acceptance status
      - `is_ai_generated` (boolean) - AI generated flag
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `votes` - User votes on questions/answers
      - `id` (uuid, primary key)
      - `user_id` (uuid) - foreign key to users
      - `target_id` (uuid) - question or answer id
      - `target_type` (enum) - 'question' or 'answer'
      - `value` (integer) - vote value (1 or -1)
      - `created_at` (timestamptz)

    - `notifications` - User notifications
      - `id` (uuid, primary key)
      - `user_id` (uuid) - foreign key to users
      - `type` (enum) - notification type
      - `title` (text) - notification title
      - `message` (text) - notification message
      - `is_read` (boolean) - read status
      - `question_id` (uuid, nullable) - related question
      - `answer_id` (uuid, nullable) - related answer
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to questions and answers
    - Add policies for voting and notifications

  3. Indexes
    - Add indexes for frequently queried columns
    - Add unique constraints where needed
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin');
CREATE TYPE vote_target_type AS ENUM ('question', 'answer');
CREATE TYPE notification_type AS ENUM ('answer', 'comment', 'mention', 'accepted');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  role user_role DEFAULT 'user',
  reputation integer DEFAULT 0,
  badge text DEFAULT 'Newcomer',
  questions_answered integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  votes integer DEFAULT 0,
  views integer DEFAULT 0,
  accepted_answer_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  author_id text NOT NULL, -- Can be user UUID or 'ai-assistant'
  votes integer DEFAULT 0,
  is_accepted boolean DEFAULT false,
  is_ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  target_id uuid NOT NULL,
  target_type vote_target_type NOT NULL,
  value integer NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for accepted_answer_id
ALTER TABLE questions 
ADD CONSTRAINT fk_accepted_answer 
FOREIGN KEY (accepted_answer_id) REFERENCES answers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Questions policies
CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own questions"
  ON questions FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Answers policies
CREATE POLICY "Anyone can read answers"
  ON answers FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = author_id OR author_id = 'ai-assistant');

CREATE POLICY "Authors can update own answers"
  ON answers FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = author_id);

CREATE POLICY "Authors can delete own answers"
  ON answers FOR DELETE
  TO authenticated
  USING (auth.uid()::text = author_id);

-- Votes policies
CREATE POLICY "Users can read all votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own votes"
  ON votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at 
  BEFORE UPDATE ON answers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();