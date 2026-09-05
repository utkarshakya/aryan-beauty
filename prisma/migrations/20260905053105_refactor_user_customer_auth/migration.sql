/*
  Warnings:

  - You are about to drop the column `clerkUserId` on the `Customer` table. All the data in the column will be lost.
  - Made the column `userId` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropIndex
DROP INDEX "Customer_clerkUserId_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "clerkUserId",
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
