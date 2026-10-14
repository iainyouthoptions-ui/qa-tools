# Discord Exporter

Exports the Discord server's text channels to HTML using
[DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) (CLI, v2.48).

## Setup on a new machine

1. **Install the tool.** Download `DiscordChatExporter.Cli.win-x64.zip` from the
   [releases page](https://github.com/Tyrrrz/DiscordChatExporter/releases/latest)
   and extract it to `C:\Tools\DiscordChatExporter`. It's self-contained, so no
   .NET install is needed.

   If you put it somewhere else, set `DCE_PATH` to the full path of
   `DiscordChatExporter.Cli.exe`, or pass `-ExePath` to the script.

2. **Set the bot token.** Get it from the Discord Developer Portal → your app →
   **Bot** → **Reset Token** (resetting invalidates the copy on any other machine,
   so reuse the existing token if you still have it). Then run:

   ```powershell
   setx DISCORD_TOKEN "your-token"
   ```

   Open a new terminal afterwards. Never commit the token or paste it anywhere public.

3. **Check it works.**

   ```powershell
   C:\Tools\DiscordChatExporter\DiscordChatExporter.Cli.exe guilds
   ```

   The server should be listed (ID `1529285282531250308`).

## Usage

```powershell
.\export.ps1                      # messages since the last run (full history on first run)
.\export.ps1 -After 2026-09-01    # messages after a specific date
.\export.ps1 -All                 # full history
.\export.ps1 -OutputRoot D:\Exports
```

Exports go to `C:\Exports\<server name>\<run date>\<channel>.html`, with threads
and attachments included. Each run gets its own folder, so nothing is overwritten.

The last-run time is saved in `.last-run` next to the script. That file isn't
committed, so each machine keeps track of its own runs.

## Channels

The channel list is at the top of `export.ps1`. It covers every text channel except
**IGNORE THIS CATEGORY**, and leaves out the voice channels. To refresh the IDs:

```powershell
C:\Tools\DiscordChatExporter\DiscordChatExporter.Cli.exe channels -g 1529285282531250308
```

## Troubleshooting

- **Messages come out blank:** turn on **Message Content Intent** under **Bot** in
  the Developer Portal.
- **Server not listed in `guilds`:** the bot hasn't been invited. Use
  **OAuth2 → URL Generator** with the `bot` scope plus **View Channels** and
  **Read Message History**.
- **`Invalid snowflake`:** an ID placeholder wasn't replaced with a real number.
