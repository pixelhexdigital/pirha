// Shared order-aging vocabulary so the Orders table and the Kitchen board read
// identically: same thresholds, same relative labels, same urgency tints.

const WARNING_AFTER_MIN = 5;
const URGENT_AFTER_MIN = 15;

/** Minutes elapsed since the given timestamp (0 for missing/invalid input). */
export const getOrderAgeMinutes = (orderTime) => {
  if (!orderTime) return 0;
  const then = new Date(orderTime).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.floor((Date.now() - then) / 60000);
};

/** Human relative label, e.g. "Just now", "6 min ago", "1h 20m ago", "2 days ago". */
export const getElapsedLabel = (orderTime) => {
  const minutes = getOrderAgeMinutes(orderTime);
  if (minutes < 1) return "Just now";

  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  return `${minutes} min ago`;
};

/**
 * Full-surface urgency tint (never a side-stripe). Empty string while fresh so
 * the caller can merge it unconditionally.
 */
export const getUrgencyTint = (orderTime) => {
  const minutes = getOrderAgeMinutes(orderTime);
  if (minutes > URGENT_AFTER_MIN)
    return "border-destructive/40 bg-destructive/[0.04]";
  if (minutes > WARNING_AFTER_MIN) return "border-warning/40 bg-warning/[0.04]";
  return "";
};

/** Text color for the elapsed label; urgent orders pulse to draw the eye. */
export const getUrgencyTextColor = (orderTime) => {
  const minutes = getOrderAgeMinutes(orderTime);
  if (minutes > URGENT_AFTER_MIN) return "text-destructive animate-pulse";
  if (minutes > WARNING_AFTER_MIN) return "text-warning";
  return "text-muted-foreground";
};
