# SSB Call Desk

A phone app for the SSB call-support agents. It has the FAQ answers, and the **Upcoming programs** list refreshes automatically every morning from Isha's program finder.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | The app itself |
| `programs.json` | Upcoming Karnataka and Sadhguru Sannidhi programs. It is rewritten every day. |
| `scripts/update-programs.mjs` | Pulls the programs from Isha's public schedule feed, the same one the program-finder page uses |
| `.github/workflows/update-programs.yml` | Runs that script every day at 5:00 AM IST |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Let agents install the app on their home screen and use it offline |

## One-time setup (about 15 minutes)

1. **Create a GitHub account** at github.com. The free plan is enough.
2. **Create a repository.** Click **New repository**, name it `ssb-call-desk`, choose **Public**, and click **Create**.
3. **Upload the files.** Click **Add file → Upload files** and drag in everything from this folder, then click **Commit changes**.
   - The `.github` folder is hidden on Mac. Press **Cmd + Shift + .** in Finder to show it.
   - If it still won't upload, click **Add file → Create new file**. Type `.github/workflows/update-programs.yml` as the name, paste the file's contents, and commit.
4. **Turn on the website.** Go to **Settings → Pages**. Under "Build and deployment", pick **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**. After a minute the app is live at `https://YOUR-USERNAME.github.io/ssb-call-desk/`.
5. **Test the daily update.** Open the **Actions** tab and enable workflows if GitHub asks. Click **Update upcoming programs**, then **Run workflow**.
   - A green tick means it's working. It will now run every morning by itself.
   - A red cross means Isha's feed refused GitHub's servers. The app keeps showing the last good list and marks it "may be out of date".

## Giving it to agents

Share the link. On Android, open it in Chrome and tap **⋮ → Add to Home screen**, or tap **Install app**. It opens like an app, works on a weak connection, and shows the date the programs were last updated.

## Editing FAQ answers

The answers are in `index.html`, in the `KB = [...]` list. Edit on GitHub with the pencil icon and commit. The app updates within a few minutes.
