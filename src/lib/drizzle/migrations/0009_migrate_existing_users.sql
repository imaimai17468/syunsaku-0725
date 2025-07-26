-- 既存のauth.usersデータをpublic.usersテーブルに移行

-- 既存のユーザーをusersテーブルに挿入（重複を避ける）
INSERT INTO public.users (id, name, avatar_url)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', '冒険者'),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
);