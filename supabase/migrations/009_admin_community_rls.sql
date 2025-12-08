-- ==========================================
-- Admin이 커뮤니티 게시글/댓글 조회할 수 있도록 RLS 정책 추가
-- ==========================================

-- 1. community_posts Admin 조회 정책
CREATE POLICY "Admins can view all community_posts"
  ON community_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- 2. community_comments Admin 조회 정책
CREATE POLICY "Admins can view all community_comments"
  ON community_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
