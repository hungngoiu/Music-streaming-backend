-- CreateTable
CREATE TABLE "playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover_image_path" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlist_name_idx" ON "playlist" USING GIN ("name" gin_trgm_ops);

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
