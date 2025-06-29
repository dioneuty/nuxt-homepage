-- SQL script to remove the "탭 관리자" (Tab Manager) menu item from the database
-- Run this script if you need to remove the existing menu item from the database

-- Delete the "탭 관리자" menu item
DELETE FROM "Menu" WHERE name = '탭 관리자' AND path = '/tabs';

-- Verify the deletion (optional - this will show remaining menu items)
-- SELECT id, name, path, "order" FROM "Menu" WHERE "parentId" IS NULL ORDER BY "order";