-- Add unique constraint for upsert support on user_widget_preferences
ALTER TABLE user_widget_preferences
ADD CONSTRAINT user_widget_preferences_user_id_selected_module_key
UNIQUE (user_id, selected_module);
