// Restaurant Timing Configuration
// Open: 12:00 AM (00:00) | Close: 11:00 PM (23:00)
// Orders accepted: 12:10 AM (10 min after open) to 10:40 PM (20 min before close)

export const RESTAURANT_HOURS = {
  openHour: 0,      // 12:00 AM
  openMinute: 0,
  closeHour: 12,    // 12:00 PM
  closeMinute: 0,
  orderStartOffsetMinutes: 10,   // start accepting orders 10 min after opening
  orderEndOffsetMinutes: 20,     // stop accepting orders 20 min before closing
};

export type TimingStatus = {
  isOpen: boolean;
  message: string;
  opensAt?: string;
  closesAt?: string;
  orderStartsAt: string;
  orderEndsAt: string;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toAmPm(hour: number, minute: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${pad(minute)} ${suffix}`;
}

export function getRestaurantTimingStatus(): TimingStatus {
  const now = new Date();
  // Use IST (UTC+5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);

  const currentMinutes = ist.getHours() * 60 + ist.getMinutes();

  const openTotalMinutes = RESTAURANT_HOURS.openHour * 60 + RESTAURANT_HOURS.openMinute;
  const closeTotalMinutes = RESTAURANT_HOURS.closeHour * 60 + RESTAURANT_HOURS.closeMinute;

  // Effective ordering window
  const orderStartMinutes = openTotalMinutes + RESTAURANT_HOURS.orderStartOffsetMinutes;
  const orderEndMinutes = closeTotalMinutes - RESTAURANT_HOURS.orderEndOffsetMinutes;

  const startH = Math.floor(orderStartMinutes / 60);
  const startM = orderStartMinutes % 60;
  const endH = Math.floor(orderEndMinutes / 60);
  const endM = orderEndMinutes % 60;

  const orderStartsAt = toAmPm(startH, startM);
  const orderEndsAt = toAmPm(endH, endM);
  const closesAt = toAmPm(RESTAURANT_HOURS.closeHour, RESTAURANT_HOURS.closeMinute);
  const opensAt = toAmPm(RESTAURANT_HOURS.openHour, RESTAURANT_HOURS.openMinute);

  const isOpen = currentMinutes >= orderStartMinutes && currentMinutes < orderEndMinutes;

  let message = "";
  if (currentMinutes < orderStartMinutes) {
    if (currentMinutes < openTotalMinutes) {
      message = `Restaurant abhi band hai. Orders ${orderStartsAt} se milenge.`;
    } else {
      message = `Restaurant khul raha hai! Orders ${orderStartsAt} se shuru honge.`;
    }
  } else if (currentMinutes >= orderEndMinutes) {
    message = `Aaj ke orders band ho gaye hain. Kal ${orderStartsAt} se order karein.`;
  } else {
    message = `Restaurant open hai. Orders ${orderEndsAt} tak milenge.`;
  }

  return { isOpen, message, opensAt, closesAt, orderStartsAt, orderEndsAt };
}
