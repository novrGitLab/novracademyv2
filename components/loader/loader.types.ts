export type LoaderPhase = "loading" | "exiting" | "complete";

export type ShowLoaderOptions = {
  /**
   * Manual mode: the loader stays until hide() is called
   * (for data-fetching screens).
   */
  manual?: boolean;
  /** Per-invocation minimum display time. Default: 1200ms. */
  minDisplayMs?: number;
};

export type LoaderController = {
  phase: LoaderPhase;
  /** Restart the loader. Optionally manual (waits for hide()). */
  show: (options?: ShowLoaderOptions) => void;
  /** Mark loading as finished; exit begins once min display elapsed. */
  hide: () => void;
};
