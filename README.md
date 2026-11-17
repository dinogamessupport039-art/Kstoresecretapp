# Kik Store GitHub Pages site

This static site is intended for the root GitHub Pages domain `your-username.github.io` (the repository must be named exactly `your-username.github.io`). The project route `/project/<ID>` falls back to `404.html` on GitHub Pages and provides app-open and download buttons.

## Configure before publishing

1. Replace `your-username.github.io` with the exact Pages domain in `site/config.js`, `.env.local` (`VITE_SHARE_DOMAIN`), and `android/app/src/main/AndroidManifest.xml` and `android/app/src/main/java/com/kikstore/app/DeepLinkPlugin.java`.
2. In `site/config.js`, set `downloadUrl` to the public APK download URL and set `publishableKey` to the Supabase **publishable** key. Never use a Supabase secret/service-role key in this file. The site reads public project metadata from the `projects` table using its public read policy.
3. The debug SHA-256 fingerprint is already filled in `site/.well-known/assetlinks.json`. Replace `SHA256_ОТПЕЧАТОК` with the release-signing certificate fingerprint before publishing a release-signed APK. The debug and release fingerprints are different.
4. Enable **Settings → Pages → Build and deployment → GitHub Actions** in the repository.
5. Push the `site/` folder to the `master` branch. GitHub Actions publishes it at `https://your-username.github.io/`.

The Android app must be rebuilt after changing the domain in the manifest and `VITE_SHARE_DOMAIN`. The domain in the manifest, environment, `site/config.js`, and `assetlinks.json` must match.

`assetlinks.json` must be served from the domain root at `https://your-username.github.io/.well-known/assetlinks.json`. A project Pages URL such as `https://your-username.github.io/repository/` is unsuitable for App Links because it adds a path prefix and cannot host `assetlinks.json` at the required domain-root address. Use the user site repository named `your-username.github.io`.
