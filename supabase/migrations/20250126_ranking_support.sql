-- ランキング機能のためのインデックスとRLSポリシーを追加

-- user_levelsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_user_levels_level_experience ON user_levels(current_level DESC, current_exp DESC);

-- login_streaksテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_login_streaks_current_streak ON login_streaks(current_streak DESC);

-- daily_activitiesテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_daily_activities_mini_game_score ON daily_activities(mini_game_score DESC) WHERE mini_game_completed = true;

-- user_achievementsテーブルのインデックス（achievedカラムが存在する場合のみ）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_achievements' 
    AND column_name = 'achieved'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_user_achievements_achieved ON user_achievements(achieved) WHERE achieved = true;
  END IF;
END $$;

-- usersテーブルのRLSを有効化（テーブルはすでに存在）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- usersテーブルのポリシー（存在しない場合のみ作成）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can view all profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles" ON users
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON users
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ランキング用のRLSポリシー（読み取り専用）
DO $$
BEGIN
  -- user_levelsのポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_levels' 
    AND policyname = 'Allow read access to all user levels'
  ) THEN
    CREATE POLICY "Allow read access to all user levels" ON user_levels
      FOR SELECT USING (true);
  END IF;

  -- login_streaksのポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'login_streaks' 
    AND policyname = 'Allow read access to all login streaks'
  ) THEN
    CREATE POLICY "Allow read access to all login streaks" ON login_streaks
      FOR SELECT USING (true);
  END IF;

  -- daily_activitiesのポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'daily_activities' 
    AND policyname = 'Allow read access to all daily activities'
  ) THEN
    CREATE POLICY "Allow read access to all daily activities" ON daily_activities
      FOR SELECT USING (true);
  END IF;

  -- achievementsテーブルのRLSとポリシー
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'achievements'
  ) THEN
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'achievements' 
      AND policyname = 'Allow read access to all achievements'
    ) THEN
      CREATE POLICY "Allow read access to all achievements" ON achievements
        FOR SELECT USING (true);
    END IF;
  END IF;

  -- user_achievementsのポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Allow read access to all user achievements'
  ) THEN
    CREATE POLICY "Allow read access to all user achievements" ON user_achievements
      FOR SELECT USING (true);
  END IF;
END $$;

-- 自動的にusersレコードを作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', '冒険者'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーが存在しない場合のみ作成
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 既存のauth.usersデータをpublic.usersテーブルに移行
INSERT INTO public.users (id, name, avatar_url)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', '冒険者'),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
);