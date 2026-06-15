/**
 * Global type declarations for custom Window properties used across the site.
 */
export {};

declare global {
  interface Window {
    /** CSRF token injected by AdminLayout for admin API calls */
    __adminCsrf?: string;
    /** TikTok Pixel tracking object */
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      load: (id: string) => void;
    };
  }
}
