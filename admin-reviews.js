import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const signInButton = document.querySelector("#admin-signin");
const signOutButton = document.querySelector("#admin-signout");
const status = document.querySelector("#admin-status");
const reviewCount = document.querySelector("#review-count");
const reviewList = document.querySelector("#admin-review-list");
const setupPanel = document.querySelector("#admin-setup");
const uidOutput = document.querySelector("#admin-uid");
const copyUidButton = document.querySelector("#copy-uid");

function setStatus(message, kind = "info") {
  status.textContent = message;
  status.dataset.kind = kind;
}

function describeSignInError(error) {
  if (error.code === "auth/operation-not-allowed") {
    return "Google sign-in is disabled. Enable Google in Firebase Console → Authentication → Sign-in method.";
  }
  if (error.code === "auth/unauthorized-domain") {
    return `This site (${window.location.hostname}) is not authorized. Add that hostname in Firebase Console → Authentication → Settings → Authorized domains.`;
  }
  if (error.code === "auth/network-request-failed") {
    return "Sign-in could not reach Firebase. Check your internet connection and try again.";
  }
  return `Google sign-in failed${error.code ? ` (${error.code})` : ""}: ${error.message || "Please try again."}`;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Just now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(timestamp.toDate());
}

function createReviewCard(id, review, updateReview) {
  const card = document.createElement("article");
  card.className = "admin-review";

  const heading = document.createElement("div");
  heading.className = "admin-review-head";
  const stars = document.createElement("span");
  stars.className = "admin-stars";
  stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;
  stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
  const date = document.createElement("time");
  date.textContent = formatDate(review.createdAt);
  heading.append(stars, date);

  const message = document.createElement("p");
  message.textContent = review.message;

  const footer = document.createElement("div");
  footer.className = "admin-review-foot";
  const name = document.createElement("strong");
  name.textContent = review.name || "Customer";
  const approveButton = document.createElement("button");
  approveButton.className = "admin-button admin-approve";
  approveButton.type = "button";
  approveButton.textContent = "Approve review";
  approveButton.addEventListener("click", () => updateReview(id, approveButton));
  footer.append(name, approveButton);

  card.append(heading, message, footer);
  return card;
}

if (!isFirebaseConfigured) {
  signInButton.disabled = true;
  setStatus("Firebase is not configured for this deployment.", "error");
} else {
  try {
    const [{ initializeApp }, authSdk, firestore] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
    ]);
    const { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } = authSdk;
    const { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, updateDoc, where } = firestore;
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();
    let stopPendingReviews = null;

    signInButton.addEventListener("click", () => signInWithPopup(auth, googleProvider).catch(error => {
      console.error("Google sign-in failed.", error);
      setStatus(describeSignInError(error), "error");
    }));
    signOutButton.addEventListener("click", () => signOut(auth).catch(error => {
      console.error("Admin sign-out failed.", error);
      setStatus("Could not sign out. Please try again.", "error");
    }));
    copyUidButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(uidOutput.textContent);
        copyUidButton.textContent = "Copied";
      } catch {
        setStatus("Select and copy the UID shown above, then add it as the admins document ID.", "error");
      }
    });

    async function approveReview(reviewId, button) {
      button.disabled = true;
      button.textContent = "Approving…";
      try {
        await updateDoc(doc(database, "reviews", reviewId), { approved: true });
        setStatus("Review approved. It will now appear on the public portfolio.", "success");
      } catch (error) {
        console.error("Could not approve review.", error);
        button.disabled = false;
        button.textContent = "Approve review";
        setStatus("Approval failed. Confirm your admin UID document exists and the Firestore rules are published.", "error");
      }
    }

    onAuthStateChanged(auth, async user => {
      if (stopPendingReviews) stopPendingReviews();
      stopPendingReviews = null;
      reviewList.replaceChildren();
      setupPanel.hidden = true;
      signInButton.hidden = Boolean(user);
      signOutButton.hidden = !user;

      if (!user) {
        reviewCount.textContent = "Sign in with the Google account you will use as administrator.";
        setStatus("Sign in to check for pending reviews.");
        return;
      }

      uidOutput.textContent = user.uid;
      setStatus(`Signed in as ${user.email || "your Google account"}. Checking administrator access…`);
      try {
        const adminRecord = await getDoc(doc(database, "admins", user.uid));
        if (!adminRecord.exists()) {
          reviewCount.textContent = "This account is not registered as a review administrator yet.";
          setupPanel.hidden = false;
          setStatus("Administrator access is not set up for this account yet.", "error");
          return;
        }

        reviewCount.textContent = `Signed in as ${user.email || "administrator"}.`;
        setStatus("Loading pending reviews…");
        const pending = query(collection(database, "reviews"), where("approved", "==", false), orderBy("createdAt", "desc"));
        stopPendingReviews = onSnapshot(pending, snapshot => {
          reviewList.replaceChildren();
          if (snapshot.empty) {
            setStatus("You’re all caught up. There are no reviews waiting for approval.", "success");
            return;
          }
          setStatus(`${snapshot.size} ${snapshot.size === 1 ? "review is" : "reviews are"} waiting for your approval.`);
          snapshot.forEach(reviewDoc => reviewList.append(createReviewCard(reviewDoc.id, reviewDoc.data(), approveReview)));
        }, error => {
          console.error("Could not load pending reviews.", error);
          setStatus("Could not load reviews. Check the Firestore rules and the reviews index.", "error");
        });
      } catch (error) {
        console.error("Could not verify review administrator.", error);
        reviewCount.textContent = "Could not verify this account.";
        setStatus("Could not check admin access. Publish the updated Firestore rules, then try again.", "error");
      }
    });
  } catch (error) {
    console.error("Review dashboard could not initialize.", error);
    signInButton.disabled = true;
    setStatus("The review dashboard could not connect to Firebase. Please try again later.", "error");
  }
}
