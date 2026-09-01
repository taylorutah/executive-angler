/**
 * Gazette chrome dates. "1 SEP" in the bar; long month on a photograph.
 * Denver is the register's home clock.
 */

class GazetteClock {
  static instant(now?: Date): Date {
    if (now) return now;
    if (process.env.EA_USGS_FIXTURE === "1") {
      return new Date("2026-08-24T18:00:00.000Z");
    }
    return new Date();
  }

  /** Chrome: "1 SEP" */
  static chrome(now?: Date): string {
    const d = GazetteClock.instant(now);
    const day = d.toLocaleString("en-US", { day: "numeric", timeZone: "America/Denver" });
    const mon = d
      .toLocaleString("en-US", { month: "short", timeZone: "America/Denver" })
      .replace(".", "")
      .toUpperCase();
    return `${day} ${mon}`;
  }

  /** Photograph caption month: "SEPTEMBER" */
  static monthLong(now?: Date): string {
    return GazetteClock.instant(now)
      .toLocaleString("en-US", { month: "long", timeZone: "America/Denver" })
      .toUpperCase();
  }

  static day(now?: Date): string {
    return GazetteClock.instant(now).toLocaleString("en-US", {
      day: "numeric",
      timeZone: "America/Denver",
    });
  }

  /** "SEPTEMBER 1" */
  static photoDay(now?: Date): string {
    return `${GazetteClock.monthLong(now)} ${GazetteClock.day(now)}`;
  }
}

export { GazetteClock };
