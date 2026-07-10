export {};

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: ((event: string, options?: { props?: PlausibleProps }) => void) & { q?: IArguments[] };
    tdTrackTikTok?: (...args: any[]) => void;
  }
}
