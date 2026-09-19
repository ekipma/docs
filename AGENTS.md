# Repository contribution rules

## Failed commands

- If a command fails, first determine whether it is a transient network failure.
- Network-dependent commands may be retried a small, reasonable number of times.
- Do not switch to unrelated workarounds or alternative approaches without informing the user.
- If retries fail, or the failure is not transient, stop and ask the user to fix the issue before continuing.
- This is especially important for commands that may depend on the network; the repository environment requires a VPN for many operations.
