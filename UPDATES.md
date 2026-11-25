# Updates – trainer guide

SunWire NL checks a file called `update.json` in your public GitHub repository:

- at every start (after about 8 seconds) and every 15 minutes while it runs;
- when the trainee chooses **Check for updates** (main menu or Esc menu).

The repository is set in `electron/update-config.json` (`owner`, `repo`, `branch`). The program only downloads files from that repository's GitHub releases, and checks each file's SHA-256 before it installs it.

## update.json

```json
{
  "latest": "2.9.0",
  "minVersion": "0.0.0",
  "force": false,
  "message": "New troubleshooting jobs for the Tedsen SW3.",
  "notes": ["SW3 receivers", "Bug fixes"],
  "windows":   { "file": "SunWire-NL-Setup-2.9.0.exe",    "sha256": "…" },
  "mac-arm64": { "file": "SunWire-NL-2.9.0-mac-arm64.zip", "sha256": "…" },
  "mac-x64":   { "file": "SunWire-NL-2.9.0-mac-x64.zip",   "sha256": "…" }
}
```

| Field | Effect |
|---|---|
| `latest` | The newest version. Older programs show "Update available". |
| `force: true` | **Remote forced update**: every program older than `latest` shows "Update required". It downloads and installs at once, and the trainee cannot skip it. |
| `minVersion` | Everything older than this is forced too; newer ones may still choose. |
| `message`, `notes` | Text shown to the trainee. |

## Publish a new version

1. Raise `version` in `package.json` and build: `npm run dist:linux-host` (Windows) and `npx electron-builder --mac dir --arm64 --x64` (Mac).
2. Run `node scripts/make-update.js --message "…" --note "…"` (add `--force` for a forced update, or `--min 2.9.0`).
   It writes `release-upload/v<version>/` with the files and `update.json`.
3. On GitHub, create the release **`v<version>`** (exactly that tag) and upload the `.exe` and the two `.zip` files.
4. Replace `update.json` in the root of the repository (main branch) with the new one.

## Force an update remotely (without a new version)

On GitHub, edit `update.json` (pencil icon), set `"force": true` and commit. Programs that are running pick it up within about 15–20 minutes; GitHub caches the file for up to 5 minutes. Programs that are closed pick it up at their next start. Set it back to `false` when everyone is updated, or leave it.

## Notes

- The repository must be **public**, or the programs cannot read it.
- Windows: the new installer runs silently into the same folder and the program restarts. No admin rights are needed.
- Mac: the app is replaced in its folder, signed locally (ad-hoc) and restarted. If the app sits in a folder the user cannot write to, the program says so; then download it by hand.
- Unsaved work in an open job is saved as "Autosave before update". Saves, results, the trainee's name and queued result e-mails are kept.
