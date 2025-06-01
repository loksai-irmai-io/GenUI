-- Remove duplicate (user_id, selected_module) rows, keeping the most recent (by saved_at or id)
DELETE FROM user_widget_preferences a
USING user_widget_preferences b
WHERE a.user_id = b.user_id
  AND a.selected_module = b.selected_module
  AND a.id < b.id;
