<#
.SYNOPSIS
    Exports the Discord server's text channels with DiscordChatExporter.

.DESCRIPTION
    Only messages posted since the last successful run are exported. The last-run
    time is saved in .last-run next to this script. On the first run (or with
    -All) the full history is exported.

    The bot token is read from the DISCORD_TOKEN environment variable and is never
    stored in this repo. See README.md for setup.

.EXAMPLE
    .\export.ps1
    .\export.ps1 -After 2026-09-01
    .\export.ps1 -All
#>
param(
    # Export messages after this date/time instead of the last-run time.
    [string]$After,

    # Ignore the last-run time and export the full history.
    [switch]$All,

    # Where exports are written. Each run gets its own dated folder.
    [string]$OutputRoot = "C:\Exports",

    [string]$ExePath = $(if ($env:DCE_PATH) { $env:DCE_PATH } else { "C:\Tools\DiscordChatExporter\DiscordChatExporter.Cli.exe" })
)

$ErrorActionPreference = "Stop"

# Every text channel except "IGNORE THIS CATEGORY". Voice channels are left out.
# Get fresh IDs with: DiscordChatExporter.Cli.exe channels -g 1529285282531250308
$channels = @(
    "1529676958575628462"  # moderator-only
    "1529676958575628459"  # rules
    "1535144555223974008"  # suggestions
    "1529285489000059090"  # Text channels / bots
    "1529285283067990069"  # Text channels / general
    "1547446962947891271"  # End of Ember / build-briefs??
    "1542754820392489031"  # End of Ember / end-of-ember
    "1552503324606210118"  # End of Ember / hyperlinks
    "1535088435935584356"  # Scourge of the Reptiles / hyperlinks
    "1529683430546083900"  # Scourge of the Reptiles / information
    "1530099238585761953"  # Scourge of the Reptiles / kyoti
    "1529683279425568979"  # Scourge of the Reptiles / reports
    "1529712480899567727"  # Scourge of the Reptiles / saves
    "1529712461178077244"  # Scourge of the Reptiles / software-builds
)

if (-not $env:DISCORD_TOKEN) {
    throw "DISCORD_TOKEN is not set. Run: setx DISCORD_TOKEN `"your-token`" and open a new terminal."
}
if (-not (Test-Path $ExePath)) {
    throw "DiscordChatExporter not found at $ExePath. See README.md, or pass -ExePath."
}

$stateFile = Join-Path $PSScriptRoot ".last-run"
$runStarted = Get-Date

if (-not $All -and -not $After -and (Test-Path $stateFile)) {
    $After = (Get-Content $stateFile -Raw).Trim()
}

# Dated folder per run, so an incremental export never overwrites an earlier one.
$outDir = Join-Path $OutputRoot ("%G\" + $runStarted.ToString("yyyy-MM-dd_HHmm"))

$exportArgs = @("export", "-c") + $channels + @(
    "--include-threads", "all",
    "--media",
    "-f", "HtmlDark",
    "-o", "$outDir\%C.html"
)
if ($After -and -not $All) {
    $exportArgs += @("--after", $After)
    Write-Host "Exporting messages after $After"
} else {
    Write-Host "Exporting full history"
}

& $ExePath @exportArgs
if ($LASTEXITCODE -ne 0) {
    throw "Export failed (exit code $LASTEXITCODE). Last-run time not updated."
}

Set-Content -Path $stateFile -Value $runStarted.ToString("yyyy-MM-dd HH:mm:ss")
Write-Host "Done. Next run will export messages after $($runStarted.ToString('yyyy-MM-dd HH:mm:ss'))"
