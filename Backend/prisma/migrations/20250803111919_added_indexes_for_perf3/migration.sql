-- This is an empty migration.

CREATE INDEX IF NOT EXISTS idx_forum_embedding_cosine 
ON "Forum" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_thread_embedding_cosine 
ON "Thread" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_post_embedding_cosine 
ON "Post" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_comment_embedding_cosine 
ON "Comment" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
