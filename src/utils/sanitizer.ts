/**
 * Safely cleans and truncates inputs to prevent XSS and layout breaking.
 */

export function sanitizeString(val: string, key?: string): string {
  // Do not truncate digital signatures or base64 data URLs
  if (key === 'signature' || val.startsWith('data:image/')) {
    return val;
  }
  // Strip HTML tags using regex
  let cleaned = val.replace(/<\/?[^>]+(>|$)/g, '');
  // Truncate to maximum of 200 characters
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200);
  }
  return cleaned;
}

export function sanitizeData<T>(data: T): T {
  if (!data) return data;
  if (typeof data === 'string') {
    return sanitizeString(data) as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item)) as any;
  }
  if (typeof data === 'object') {
    const res: any = {};
    Object.keys(data).forEach((k) => {
      const val = (data as any)[k];
      if (typeof val === 'string') {
        res[k] = sanitizeString(val, k);
      } else if (typeof val === 'object') {
        res[k] = sanitizeData(val);
      } else {
        res[k] = val;
      }
    });
    return res;
  }
  return data;
}
