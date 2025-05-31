
import { supabase } from '@/integrations/supabase/client';

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
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, any>;
  is_active: boolean;
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
      .eq('user_id', userId)
      .eq('is_active', true);

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

    // Deactivate all current preferences
    const { error: deactivateError } = await supabase
      .from('user_widget_preferences')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('Error deactivating preferences:', deactivateError);
      throw deactivateError;
    }

    // Create new preferences for selected widgets
    const preferences = availableWidgets.map(widget => ({
      user_id: userId,
      widget_id: widget.id,
      is_active: true,
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      settings: {}
    }));

    const { error: insertError } = await supabase
      .from('user_widget_preferences')
      .upsert(preferences, {
        onConflict: 'user_id,widget_id',
        ignoreDuplicates: false
      });

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
