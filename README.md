# Midnight Reminder
A Pi extension that serves as a gentle reminder to stop working past midnight.

## Midnight Reminder: Acceptance Criteria

- Uses the local time zone of the machine running Pi. Late-night hours are 00:00 inclusive to 06:00 exclusive.
- Displays a visible message such as "It is after midnight. Consider saving your work and getting some sleep." The user remains free to continue.
- While interactive Pi is open and the computer is awake, the reminder appears within one minute after midnight without another user prompt.
- If Pi starts between 00:00 and 06:00, the reminder shows on startup. If execution resumes after a pause during that window, it shows on the next check.
- At most one automatic reminder per local calendar date per extension session. Repeated prompts and timer checks do not produce duplicates.
- A fresh session or extension reload may remind again. Persistence across restarts is optional. Separate Pi processes keep separate state.
- `/bedtime-test` previews the message without changing the automatic reminder state.
- The timer stops when the extension session shuts down. Reloading does not accumulate timers or use an old session context.
- No extra model calls, no blocking tools, no terminating Pi. In noninteractive mode, skip both notification and timer creation.
- If the computer resumes after 06:00, the missed reminder is skipped.