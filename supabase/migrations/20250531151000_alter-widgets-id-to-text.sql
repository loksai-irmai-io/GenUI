-- Change widgets.id from uuid to text to support string IDs used by the app
ALTER TABLE user_widget_preferences
DROP CONSTRAINT
IF
  EXISTS user_widget_preferences_widget_id_fkey;
  ALTER TABLE widgets
  ALTER COLUMN id TYPE text
  USING id: :text;
  ALTER TABLE user_widget_preferences
  ALTER COLUMN widget_id TYPE text
  USING widget_id: :text;