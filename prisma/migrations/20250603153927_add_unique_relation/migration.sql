/*
  Warnings:

  - You are about to drop the `playlist` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[playlistId,playlistOrder]` on the table `playlist_song` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "playlist" DROP CONSTRAINT "playlist_user_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist_song" DROP CONSTRAINT "playlist_song_playlistId_fkey";

-- DropTable
DROP TABLE "playlist";

-- CreateTable
CREATE TABLE "playlists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover_image_path" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlists_name_idx" ON "playlists" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
ALTER TABLE "playlist_song" ADD CONSTRAINT "playlist_song_playlistId_playlistOrder_key" UNIQUE ("playlistId", "playlistOrder") DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_song" ADD CONSTRAINT "playlist_song_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
