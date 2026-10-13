# Riddhi Siddhi Enterprises portfolio

A responsive, no-build static portfolio designed for GitHub Pages. The hero includes an animated 3D purifier, built with Three.js; a CSS illustration remains available when WebGL or the CDN is unavailable. The rest of the site has no build step.

## Update the business details

Edit `content.js` to set the correct public phone number, dialable phone number and email address. The details in the supplied poster were used as the phone number; the email is a placeholder and should be replaced before publishing.

Update the copy and service descriptions directly in `index.html`. The gallery uses the five supplied product and equipment photos; these are representative images, not claims of completed customer installations.

## Feedback and contact forms

GitHub Pages serves static files and does not process form submissions. The contact and feedback forms validate their required fields and open the visitor's email app with a prefilled message addressed to the email in `content.js`. Visitors still need to press Send in their email app. If you later want on-page form delivery, connect a form service or your own backend.

## Publish on GitHub Pages

1. Put the site files in the repository root.
2. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Push or merge changes into `master`; `.github/workflows/pages.yml` deploys them automatically. You can also run it from the Actions tab.
4. Open the Pages URL shown in repository settings.

No build command is required. Deployment still waits for GitHub Pages to finish publishing; a custom workflow automates the steps but cannot speed up that service-side wait.

The interactive 3D scenes are in `three-scene.js` and `water-story.js`; they load Three.js from jsDelivr and need an internet connection. The water-story scene adds its section to the page, animates a person lifting a glass, and labels the pH value as an example rather than a live test. A static fallback appears if WebGL or the CDN is unavailable. `theme.css` contains the dark visual theme, and `script.js` handles the responsive navigation and small interactions.

Visitors can switch between dark and light appearance with the navigation theme button. Their choice is saved in local storage.

The photo river uses all five supplied images. The optional water ambience is synthesized in the browser and starts only when the visitor presses its button. The Hindi slogan can also be spoken on demand using the browser's Hindi speech voice when available.


## Uploaded images

The images/ folder contains the supplied purifier and commercial equipment photos. The product and solutions sections reference these files directly, so keep the folder alongside index.html when publishing to GitHub Pages.
