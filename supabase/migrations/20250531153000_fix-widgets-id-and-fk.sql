-- Drop the foreign key constraint first
ALTER TABLE user_widget_preferences
DROP CONSTRAINT
IF
  EXISTS user_widget_preferences_widget_id_fkey;
  -- Change widgets.id and user_widget_preferences.widget_id to text
  ALTER TABLE widgets
  ALTER COLUMN id TYPE text;
  ALTER TABLE user_widget_preferences
  ALTER COLUMN widget_id TYPE text;
  -- Re-add the foreign key constraint
  ALTER TABLE user_widget_preferences
  ADD CONSTRAINT user_widget_preferences_widget_id_fkey FOREIGN KEY (widget_id) REFERENCES widgets(id);