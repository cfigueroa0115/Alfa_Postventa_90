ALTER TABLE feedback DROP CONSTRAINT IF EXISTS chk_feedback_ces_score;
ALTER TABLE feedback ADD CONSTRAINT chk_feedback_ces_score CHECK (ces_score >= 1 AND ces_score <= 7);
