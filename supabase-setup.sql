-- Шаг 1: Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Шаг 2: Создание таблицы проектов
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  type TEXT,
  season TEXT,
  body_type TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Шаг 3: Создание индексов
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Шаг 4: Включение Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Шаг 5: Политики доступа
-- Для тестирования временно открываем доступ
-- После настройки Telegram auth эти политики будут усилены

CREATE POLICY IF NOT EXISTS "Enable read for all users" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for all users" 
  ON users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for all users" 
  ON projects FOR INSERT 
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable update for all users" 
  ON projects FOR UPDATE 
  USING (true);

CREATE POLICY IF NOT EXISTS "Enable delete for all users" 
  ON projects FOR DELETE 
  USING (true);

-- Готово! Таблицы созданы
