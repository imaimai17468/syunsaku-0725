-- achievementsテーブルにpointsカラムを追加
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 100;

-- 既存の実績にポイントを設定（reward_expの値を基に）
UPDATE achievements 
SET points = CASE
    WHEN reward_exp >= 2000 THEN 500  -- 高難度実績
    WHEN reward_exp >= 1000 THEN 300  -- 中難度実績
    WHEN reward_exp >= 500 THEN 200   -- 通常実績
    ELSE 100                          -- 基本実績
END
WHERE points = 100; -- デフォルト値のままのものだけ更新