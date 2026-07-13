/**
 * Hands control back to the browser between chunks of a long job.
 *
 * Rasterising or re-encoding every page of a PDF is a single long task on the
 * main thread: while it runs, clicks and keystrokes queue up and INP goes
 * through the roof. Awaiting this between pages lets the browser paint progress
 * and respond to input.
 *
 * Uses `scheduler.yield()` where available (it resumes with higher priority than
 * a bare setTimeout, so yielding stays cheap) and falls back where it isn't.
 */
type SchedulerWithYield = { yield?: () => Promise<void> };

export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: SchedulerWithYield }).scheduler;

  if (typeof scheduler?.yield === "function") {
    return scheduler.yield();
  }

  return new Promise((resolve) => setTimeout(resolve, 0));
}
