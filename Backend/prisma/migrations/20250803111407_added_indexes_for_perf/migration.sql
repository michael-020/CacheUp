-- CreateIndex
CREATE INDEX "idx_comment_mongo_id" ON "public"."Comment"("mongoId");

-- CreateIndex
CREATE INDEX "idx_comment_post_id" ON "public"."Comment"("postId");

-- CreateIndex
CREATE INDEX "idx_comment_post_mongo" ON "public"."Comment"("postId", "mongoId");

-- CreateIndex
CREATE INDEX "idx_forum_mongo_id" ON "public"."Forum"("mongoId");

-- CreateIndex
CREATE INDEX "idx_post_mongo_id" ON "public"."Post"("mongoId");

-- CreateIndex
CREATE INDEX "idx_post_thread_id" ON "public"."Post"("threadId");

-- CreateIndex
CREATE INDEX "idx_post_thread_mongo" ON "public"."Post"("threadId", "mongoId");

-- CreateIndex
CREATE INDEX "idx_thread_mongo_id" ON "public"."Thread"("mongoId");

-- CreateIndex
CREATE INDEX "idx_thread_forum_id" ON "public"."Thread"("forumId");

-- CreateIndex
CREATE INDEX "idx_thread_forum_mongo" ON "public"."Thread"("forumId", "mongoId");


