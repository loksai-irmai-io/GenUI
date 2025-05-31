
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Use the actual database types
type DbWidget = Database['public']['Tables']['widgets']['Row'];
type DbUserWidgetPreference = Database['public']['Tables']['user_widget_preferences']['Row'];

export interface Widget {
  id: string;
  widget_name: string;
  widget_category: string;
  description: string | null;
}

export interface UserWidgetPreference {
  id: string;
  user_id: string;
  widget_id: string;
  saved_at: string;
  selected_module: string | null;
  widget: Widget;
}

class WidgetService {
  async getAvailableWidgets(): Promise<Widget[]> {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .order('widget_category', { ascending: true });

    if (error) {
      console.error('Error fetching widgets:', error);
      throw error;
    }

    return data || [];
  }

  async getUserWidgetPreferences(userId: string): Promise<UserWidgetPreference[]> {
    const { data, error } = await supabase
      .from('user_widget_preferences')
      .select(`
        *,
        widget:widgets(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user widget preferences:', error);
      throw error;
    }

    return data || [];
  }

  async saveUserWidgetPreferences(userId: string, widgetNames: string[]): Promise<void> {
    console.log('Saving widget preferences for user:', userId, 'widgets:', widgetNames);

    // First, get all available widgets
    const { data: availableWidgets, error: widgetError } = await supabase
      .from('widgets')
      .select('id, widget_name')
      .in('widget_name', widgetNames);

    if (widgetError) {
      console.error('Error fetching widgets:', widgetError);
      throw widgetError;
    }

    if (!availableWidgets || availableWidgets.length === 0) {
      console.error('No widgets found for names:', widgetNames);
      throw new Error('No widgets found');
    }

    // Delete all current preferences for this user
    const { error: deleteError } = await supabase
      .from('user_widget_preferences')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting old preferences:', deleteError);
      throw deleteError;
    }

    // Create new preferences for selected widgets
    const preferences = availableWidgets.map(widget => ({
      user_id: userId,
      widget_id: widget.id,
    }));

    const { error: insertError } = await supabase
      .from('user_widget_preferences')
      .insert(preferences);

    if (insertError) {
      console.error('Error saving preferences:', insertError);
      throw insertError;
    }

    console.log('Successfully saved widget preferences');
  }

  async getWidgetByName(widgetName: string): Promise<Widget | null> {
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('widget_name', widgetName)
      .single();

    if (error) {
      console.error('Error fetching widget by name:', error);
      return null;
    }

    return data;
  }
}

export const widgetService = new WidgetService();
