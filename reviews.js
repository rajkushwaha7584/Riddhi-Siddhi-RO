import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const form = document.querySelector("#review-form");
const reviewList = document.querySelector("#published-reviews");
const summary = document.querySelector("#review-summary");
const submitButton = form?.querySelector('[type="submit"]');
const status = form?.querySelector(".form-status");

function showMessage(container, message) {
  if (!container) return;
  const paragraph = document.createElement("p");
  paragraph.className = "review-loading";
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}

function renderReviews(reviews) {
  if (!reviewList || !summary) return;
  if (reviews.length === 0) {
    summary.textContent = "Be the first to share your experience.";
    showMessage(reviewList, "No approved reviews yet. Your review can be the first.");
    return;
  }

  const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  summary.textContent = `${average.toFixed(1)} / 5 \u00b7 ${reviews.length} recent ${reviews.length === 1 ? "review" : "reviews"}`;
  const cards = reviews.map(review => {
    const card = document.createElement("article");
    card.className = "review-card";

    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    stars.textContent = `${"\u2605".repeat(review.rating)}${"\u2606".repeat(5 - review.rating)}`;

    const message = document.createElement("p");
    message.className = "review-message";
    message.textContent = review.message;

    const footer = document.createElement("div");
    footer.className = "review-card-footer";
    const name = document.createElement("strong");
    name.textContent = review.name;
    const date = document.createElement("time");
    if (review.createdAt?.toDate) {
      const reviewDate = review.createdAt.toDate();
      date.dateTime = reviewDate.toISOString();
      date.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(reviewDate);
    } else {
      date.textContent = "Recently";
    }
    footer.append(name, date);
    card.append(stars, message, footer);
    return card;
  });
  reviewList.replaceChildren(...cards);
}

if (!isFirebaseConfigured) {
  showMessage(reviewList, "Customer reviews will appear here once Firebase is connected.");
  if (summary) summary.textContent = "Review sharing is being set up.";
  if (status) status.textContent = "Reviews are not connected yet. Add your Firebase Web App settings to .env for local preview and to GitHub Actions Variables for the published site, then enable Firestore.";
  if (submitButton) submitButton.disabled = true;
} else {
  try {
    const [{ initializeApp }, firestore] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
    ]);
    const { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, where } = firestore;
    const database = getFirestore(initializeApp(firebaseConfig));
    const approvedReviews = query(
      collection(database, "reviews"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
      limit(9)
    );

    onSnapshot(approvedReviews,
      snapshot => renderReviews(snapshot.docs.map(document => document.data())),
      error => {
        console.error("Unable to load customer reviews.", error);
        if (summary) summary.textContent = "Reviews are temporarily unavailable.";
        showMessage(reviewList, "Please check back soon.");
      }
    );

    form?.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const values = new FormData(form);
      const rating = Number(values.get("rating"));
      const message = String(values.get("message") || "").trim();
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        if (status) status.textContent = "Please choose a star rating before posting.";
        return;
      }
      if (message.length < 5) {
        if (status) status.textContent = "Please write at least five characters in your review.";
        return;
      }

      submitButton.disabled = true;
      if (status) status.textContent = "Sending your review...";
      try {
        await addDoc(collection(database, "reviews"), {
          name: String(values.get("name") || "").trim().slice(0, 80) || "Customer",
          message: message.slice(0, 1200),
          rating,
          approved: false,
          createdAt: serverTimestamp()
        });
        form.reset();
        if (status) status.textContent = "Thanks! Your review was sent and will appear here after approval.";
      } catch (error) {
        console.error("Unable to submit customer review.", error);
        if (status) status.textContent = "Your review could not be sent. Please try again later.";
      } finally {
        submitButton.disabled = false;
      }
    });
  } catch (error) {
    console.error("Firebase reviews could not initialize.", error);
    if (summary) summary.textContent = "Reviews are temporarily unavailable.";
    showMessage(reviewList, "Please check back soon.");
    if (status) status.textContent = "The review service could not connect. Please try again later.";
    if (submitButton) submitButton.disabled = true;
  }
}
