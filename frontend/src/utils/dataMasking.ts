/**
 * Data Masking Utilities for FraternityBase
 *
 * Implements tier-based partial data masking to create incentives for unlocking
 */

export type MaskingTier = 'free' | 'pro' | 'unlocked';

/**
 * Mask a person's name based on tier
 *
 * @param name - Full name (e.g., "Tyler Alesse")
 * @param tier - User's subscription tier
 * @returns Masked name
 *
 * @example
 * maskName("Tyler Alesse", "free") // "Tyler XXXXX"
 * maskName("Tyler Alesse", "pro") // "Tyler A."
 * maskName("Tyler Alesse", "unlocked") // "Tyler Alesse"
 */
export function maskName(name: string, tier: MaskingTier): string {
  if (tier === 'unlocked') return name;
  if (!name || name.trim() === '') return 'XXXXX';

  const parts = name.trim().split(' ');
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

  if (tier === 'free') {
    // Free tier: Show first name only, obscure last name completely
    return lastName ? `${firstName} XXXXX` : firstName;
  } else {
    // Pro tier: Show first name + last initial
    return lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;
  }
}

/**
 * Mask an email address based on tier
 *
 * @param email - Email address (e.g., "tyleralesse@psu.edu")
 * @param tier - User's subscription tier
 * @returns Masked email
 *
 * @example
 * maskEmail("tyleralesse@psu.edu", "free") // "tylxxxxx@psu.edu"
 * maskEmail("tyleralesse@psu.edu", "pro") // "tyle****@psu.edu"
 * maskEmail("tyleralesse@psu.edu", "unlocked") // "tyleralesse@psu.edu"
 */
export function maskEmail(email: string, tier: MaskingTier): string {
  if (tier === 'unlocked') return email;
  if (!email || !email.includes('@')) return 'xxxxx@xxxxx.xxx';

  const [localPart, domain] = email.split('@');

  if (tier === 'free') {
    // Free tier: Show first 3 characters, obscure rest
    const visibleChars = Math.min(3, localPart.length);
    const obscured = 'x'.repeat(Math.max(0, localPart.length - visibleChars));
    return `${localPart.substring(0, visibleChars)}${obscured}@${domain}`;
  } else {
    // Pro tier: Show first 4 characters, use asterisks
    const visibleChars = Math.min(4, localPart.length);
    const obscured = '*'.repeat(Math.max(0, localPart.length - visibleChars));
    return `${localPart.substring(0, visibleChars)}${obscured}@${domain}`;
  }
}

/**
 * Mask a phone number based on tier
 *
 * @param phone - Phone number (e.g., "555-123-4567" or "(555) 123-4567")
 * @param tier - User's subscription tier
 * @returns Masked phone
 *
 * @example
 * maskPhone("555-123-4567", "free") // "555-XXX-XXXX"
 * maskPhone("555-123-4567", "pro") // "555-123-XXXX"
 * maskPhone("555-123-4567", "unlocked") // "555-123-4567"
 */
export function maskPhone(phone: string, tier: MaskingTier): string {
  if (tier === 'unlocked') return phone;
  if (!phone || phone.trim() === '') return 'XXX-XXX-XXXX';

  // Extract just the digits
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10) {
    return 'XXX-XXX-XXXX';
  }

  // Format as: XXX-XXX-XXXX (US format)
  const areaCode = digits.substring(0, 3);
  const exchange = digits.substring(3, 6);
  const subscriber = digits.substring(6, 10);

  if (tier === 'free') {
    // Free tier: Show area code only
    return `${areaCode}-XXX-XXXX`;
  } else {
    // Pro tier: Show area code + exchange
    return `${areaCode}-${exchange}-XXXX`;
  }
}

/**
 * Check if data should be masked based on unlock status and tier
 *
 * @param isUnlocked - Whether the chapter has been unlocked
 * @param subscriptionTier - User's subscription tier
 * @returns The effective masking tier to use
 */
export function getMaskingTier(
  isUnlocked: boolean,
  subscriptionTier: string
): MaskingTier {
  // If unlocked, always show full data
  if (isUnlocked) return 'unlocked';

  // If not unlocked, determine tier based on subscription
  const tier = subscriptionTier.toLowerCase();

  if (tier === 'enterprise' || tier === 'monthly' || tier === 'pro') {
    return 'pro';
  }

  // Default to free tier (trial, free, or no subscription)
  return 'free';
}

/**
 * Get a visual indicator (emoji) for masked data
 */
export function getMaskingIndicator(tier: MaskingTier): string {
  if (tier === 'free') return '🔒'; // Locked
  if (tier === 'pro') return '🔓'; // Partially unlocked
  return '✅'; // Fully unlocked
}
