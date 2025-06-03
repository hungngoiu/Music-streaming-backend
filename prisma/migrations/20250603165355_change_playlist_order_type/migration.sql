/*
  Warnings:

  - Changed the type of `playlistOrder` on the `playlist_song` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "playlist_song" DROP COLUMN "playlistOrder",
ADD COLUMN     "playlistOrder" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "playlist_song_playlistId_playlistOrder_key" ON "playlist_song"("playlistId", "playlistOrder");
