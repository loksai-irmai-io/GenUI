
// Utility functions for user-related operations

export function capitalizeUsername(username: string): string {
  if (!username) return '';
  return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
}

export function formatUserDisplayName(user: any): string {
  if (!user) return 'Guest';
  
  // If user has a name property, capitalize it
  if (user.name) {
    return capitalizeUsername(user.name);
  }
  
  // If user has email, use the part before @ and capitalize it
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    return capitalizeUsername(emailPrefix);
  }
  
  // Fallback to user ID or 'User'
  return user.id ? `User ${user.id.substring(0, 8)}` : 'User';
}
