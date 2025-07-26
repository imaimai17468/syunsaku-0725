-- Row Level Security (RLS) を有効化
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- user_levels のポリシー
CREATE POLICY "Users can view own level" ON user_levels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own level" ON user_levels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level" ON user_levels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- login_streaks のポリシー
CREATE POLICY "Users can view own login streak" ON login_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own login streak" ON login_streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own login streak" ON login_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_activities のポリシー
CREATE POLICY "Users can view own activities" ON daily_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON daily_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON daily_activities
    FOR UPDATE USING (auth.uid() = user_id);

-- user_inventory のポリシー
CREATE POLICY "Users can view own inventory" ON user_inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items" ON user_inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items" ON user_inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items" ON user_inventory
    FOR DELETE USING (auth.uid() = user_id);

-- user_achievements のポリシー
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- reward_items は読み取り専用（マスターデータ）
CREATE POLICY "Anyone can view reward items" ON reward_items
    FOR SELECT USING (true);

-- achievements は読み取り専用（マスターデータ）
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

-- 関数レベルのセキュリティ
-- 1日1回制限を強制するための関数
CREATE OR REPLACE FUNCTION check_daily_limit(p_user_id UUID, p_activity_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 今日の日付で該当するアクティビティが既に存在するかチェック
    IF p_activity_type = 'roulette' THEN
        RETURN NOT EXISTS (
            SELECT 1 FROM daily_activities 
            WHERE user_id = p_user_id 
            AND activity_date = CURRENT_DATE 
            AND roulette_completed = true
        );
    ELSIF p_activity_type = 'mini_game' THEN
        RETURN NOT EXISTS (
            SELECT 1 FROM daily_activities 
            WHERE user_id = p_user_id 
            AND activity_date = CURRENT_DATE 
            AND mini_game_completed = true
        );
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- レート制限用のテーブル
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, action_type, window_start)
);

-- レート制限のRLSポリシー
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON rate_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits" ON rate_limits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits" ON rate_limits
    FOR UPDATE USING (auth.uid() = user_id);