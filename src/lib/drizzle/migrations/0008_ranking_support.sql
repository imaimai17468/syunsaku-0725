-- ランキング機能のためのインデックスとRLSポリシーを追加

-- user_levelsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_user_levels_level_experience ON user_levels(level DESC, experience DESC);

-- login_streaksテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_login_streaks_current_streak ON login_streaks(current_streak DESC);

-- daily_activitiesテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_daily_activities_mini_game_score ON daily_activities(mini_game_score DESC) WHERE activity_type = 'mini_game';

-- user_achievementsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_user_achievements_achieved ON user_achievements(achieved) WHERE achieved = true;

-- usersテーブルのRLSを有効化（テーブルはすでに存在）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- usersテーブルのポリシー
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_levelsのRLSポリシー（読み取り専用）
CREATE POLICY "Allow read access to all user levels" ON user_levels
  FOR SELECT USING (true);

-- login_streaksのRLSポリシー（読み取り専用）
CREATE POLICY "Allow read access to all login streaks" ON login_streaks
  FOR SELECT USING (true);

-- daily_activitiesのRLSポリシー（読み取り専用）
CREATE POLICY "Allow read access to all daily activities" ON daily_activities
  FOR SELECT USING (true);

-- achievementsテーブルのRLSポリシー（読み取り専用）
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all achievements" ON achievements
  FOR SELECT USING (true);

-- user_achievementsのRLSポリシー（読み取り専用）
CREATE POLICY "Allow read access to all user achievements" ON user_achievements
  FOR SELECT USING (true);

-- 自動的にusersレコードを作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', '冒険者'),
    new.raw_user_meta_data->>'avatar_url'
  );
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