-- Migration: multi-image support and notes feature

-- Drop old single imageUrl column from Entry
ALTER TABLE "Entry" DROP COLUMN IF EXISTS "imageUrl";

-- Add imageUrls array column to Entry
ALTER TABLE "Entry" ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[] NOT NULL DEFAULT '{}';

-- Create Note table
CREATE TABLE IF NOT EXISTS "Note" (
    "id"        TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint for Note.userId → User.id
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
