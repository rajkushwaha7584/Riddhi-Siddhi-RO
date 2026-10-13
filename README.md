# Riddhi Siddhi Enterprises portfolio

A responsive, no-build static portfolio designed for GitHub Pages. The hero includes an animated 3D purifier, built with Three.js; a CSS illustration remains available when WebGL or the CDN is unavailable. The rest of the site has no build step.

## Update business details and deployment settings

The site settings are kept together in `.env`. It is ignored by Git, so it stays on your computer. Start with the tracked `.env.example` if needed. Run `python .github/scripts/build_config.py` after changing it; this generates `content.js` and `firebase-config.js` for local preview. The generated files contain browser-visible values and should not contain private credentials.

For GitHub Pages, add the same keys as **repository Variables** under **Settings → Secrets and variables → Actions → Variables**. The deploy workflow generates the public config from those variables. Without Actions Variables, it uses the default values in the generator. Firebase web app config is public by design; never use a Firebase service-account key or other server secret in this static site.

Update the copy and service descriptions directly in `index.html`. The gallery uses the five supplied product and equipment photos; these are representative images, not claims of completed customer installations.

## Customer reviews and contact form

The contact form opens the visitor's email app with a prefilled enquiry. Customer reviews use Firebase Cloud Firestore: customers submit a name (optional), a 1–5 star rating and a message. New reviews are private until you approve them; only approved reviews appear in the portfolio.

### Connect Firebase reviews

1. Create a Firebase project on the Spark plan, add a Web app, and create its Cloud Firestore database.
2. Copy the Web app configuration from **Project settings → Your apps** into the Firebase keys in `.env` for local preview and into the matching GitHub Actions repository Variables for the deployed site. The Firebase web config is intended for browser code; never put a service-account private key in this repository.
3. In Firestore **Rules**, publish the contents of `firestore.rules`.
4. Create the composite index described in `firestore.indexes.json` (collection `reviews`, `approved` ascending, `createdAt` descending). Alternatively, deploy the included `firebase.json`, rules and index with the Firebase CLI:

   ```sh
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. Commit and deploy the site. To publish a review, open Firestore → `reviews`, edit that review, and change `approved` from `false` to `true`.

Until the web config is filled in and the Firestore rules/index are deployed, the review form stays disabled and the page displays a setup message. The free Firebase Spark plan has usage limits; check Firebase's current [Firestore pricing](https://firebase.google.com/docs/firestore/pricing) before launch. Basic Firestore rules validate submissions and keep pending reviews off the public page, but they do not provide strong rate limiting against spam.

## Publish on GitHub Pages

1. Put the site files in the repository root.
2. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Push or merge changes into `master`; `.github/workflows/pages.yml` deploys them automatically. You can also run it from the Actions tab.
4. Open the Pages URL shown in repository settings.

No build command is required. Deployment still waits for GitHub Pages to finish publishing; a custom workflow automates the steps but cannot speed up that service-side wait.

The interactive hero scene is in `three-scene.js`; it loads Three.js from jsDelivr and needs an internet connection. The water-story section uses the uploaded video. `theme.css` contains the dark visual theme, and `script.js` handles the responsive navigation and small interactions.

Visitors can switch between dark and light appearance with the navigation theme button. Their choice is saved in local storage.

The photo river uses all five supplied images. The optional water ambience plays the supplied MP3 and starts only when the visitor presses its button. The Hindi slogan can also be spoken on demand using the browser's Hindi speech voice when available.


## Uploaded images

The images/ folder contains the supplied purifier and commercial equipment photos. The product and solutions sections reference these files directly, so keep the folder alongside index.html when publishing to GitHub Pages.
