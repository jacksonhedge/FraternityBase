import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface NotificationData {
  type: 'payment' | 'intro_request' | 'unlock' | 'subscription' | 'other';
  title: string;
  message: string;
  data?: Record<string, any>;
  relatedCompanyId?: string;
  relatedUserEmail?: string;
}

export class AdminNotificationService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new admin notification
   */
  async createNotification(notification: NotificationData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('admin_notifications')
        .insert([{
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          related_company_id: notification.relatedCompanyId,
          related_user_email: notification.relatedUserEmail,
          read: false,
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Failed to create admin notification:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Admin notification created: ${notification.type} - ${notification.title}`);
      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('❌ Error creating admin notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all notifications with optional filters
   */
  async getNotifications(filters: {
    unreadOnly?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ success: boolean; data?: any[]; count?: number; error?: string }> {
    try {
      let query = this.supabase
        .from('admin_notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.unreadOnly) {
        query = query.eq('read', false);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Failed to fetch notifications:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [], count: count || 0 };
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Failed to mark notification as read:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Notification marked as read: ${notificationId}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('❌ Failed to mark all notifications as read:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ All notifications marked as read');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Failed to delete notification:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Notification deleted: ${notificationId}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { count, error } = await this.supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      if (error) {
        console.error('❌ Failed to get unread count:', error);
        return { success: false, error: error.message };
      }

      return { success: true, count: count || 0 };
    } catch (error: any) {
      console.error('❌ Error getting unread count:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AdminNotificationService;
