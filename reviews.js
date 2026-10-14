import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const form = document.querySelector("#review-form");
const reviewList = document.querySelector("#published-reviews");
const summary = document.querySelector("#review-summary");
const submitButton = form?.querySelector('[type="submit"]');
const status = form?.querySelector(".form-status");
const reviewViewport = document.querySelector("#review-viewport");
const reviewControls = document.querySelector("#review-carousel-controls");
const reviewPagination = document.querySelector("#review-pagination");
const reviewPageStatus = document.querySelector("#review-page-status");
const previousReviewsButton = document.querySelector("[data-review-prev]");
const nextReviewsButton = document.querySelector("[data-review-next]");
let latestReviews = [];
let pageCapacity = 0;
let lastActivePage = -1;

function reviewsPerPage() {
  if (matchMedia("(max-width: 620px)").matches) return 1;
  if (matchMedia("(max-width: 980px)").matches) return 2;
  return 3;
}

function showMessage(container, message) {
  if (!container) return;
  const paragraph = document.createElement("p");
  paragraph.className = "review-loading";
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
  updateCarouselControls();
}

function renderReviewDots(activePage, pageCount) {
  if (!reviewPagination) return;
  reviewPagination.replaceChildren();
  const visibleDotCount = Math.min(7, pageCount);
  const firstPage = Math.max(0, Math.min(activePage - Math.floor(visibleDotCount / 2), pageCount - visibleDotCount));

  for (let page = firstPage; page < firstPage + visibleDotCount; page += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "review-dot";
    dot.setAttribute("aria-label", `Show review page ${page + 1}`);
    if (page === activePage) dot.setAttribute("aria-current", "page");
    dot.addEventListener("click", () => setReviewPage(page));
    reviewPagination.append(dot);
  }
}

function updateCarouselControls() {
  if (!reviewList || !reviewViewport) return;
  const pageCount = reviewList.querySelectorAll(":scope > .review-page").length;
  const width = reviewViewport.clientWidth || 1;
  const activePage = Math.min(pageCount - 1, Math.max(0, Math.round(reviewViewport.scrollLeft / width)));
  if (reviewControls) reviewControls.hidden = pageCount < 2;
  if (previousReviewsButton) previousReviewsButton.disabled = activePage <= 0;
  if (nextReviewsButton) nextReviewsButton.disabled = activePage >= pageCount - 1;
  if (reviewPageStatus) reviewPageStatus.textContent = pageCount ? `Page ${activePage + 1} of ${pageCount}` : "";
  if (activePage !== lastActivePage) {
    lastActivePage = activePage;
    renderReviewDots(activePage, pageCount);
  }
}

function setReviewPage(page) {
  if (!reviewViewport || !reviewList) return;
  const pageCount = reviewList.querySelectorAll(":scope > .review-page").length;
  if (!pageCount) return;
  const targetPage = Math.min(pageCount - 1, Math.max(0, page));
  reviewViewport.scrollTo({
    left: targetPage * reviewViewport.clientWidth,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
  });
  updateCarouselControls();
}

previousReviewsButton?.addEventListener("click", () => {
  if (!reviewViewport) return;
  setReviewPage(Math.round(reviewViewport.scrollLeft / (reviewViewport.clientWidth || 1)) - 1);
});
nextReviewsButton?.addEventListener("click", () => {
  if (!reviewViewport) return;
  setReviewPage(Math.round(reviewViewport.scrollLeft / (reviewViewport.clientWidth || 1)) + 1);
});
reviewViewport?.addEventListener("scroll", () => requestAnimationFrame(updateCarouselControls), { passive: true });
window.addEventListener("resize", () => {
  if (latestReviews.length && reviewsPerPage() !== pageCapacity) renderReviews(latestReviews);
  else updateCarouselControls();
}, { passive: true });

function addCardCreatures(card, rating) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || card.querySelector(".review-creature")) return;

  const svgNamespace = "http://www.w3.org/2000/svg";
  const isFish = rating >= 3;
  const count = Math.max(1, Math.min(5, rating));
  for (let index = 0; index < count; index += 1) {
    const creature = document.createElement("span");
    creature.className = isFish ? "review-creature review-fish" : "review-creature review-bird";
    creature.setAttribute("aria-hidden", "true");
    creature.style.setProperty("--creature-index", String(index));
    creature.style.setProperty("--creature-x", `${((index + 1) / (count + 1)) * 100}%`);
    creature.style.setProperty("--creature-size", `${isFish && count >= 4 ? 38 : 46}px`);
    creature.style.setProperty("--bird-offset", `${index * 10}px`);

    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", isFish ? "0 0 64 42" : "0 0 64 40");
    svg.setAttribute("focusable", "false");
    const shape = document.createElementNS(svgNamespace, "path");
    if (isFish) {
      shape.setAttribute("d", "M8 21 1 11l2 12-2 9 9-6c8 10 25 13 38 4l14 7-3-16 3-15-15 8C34 6 17 10 8 21Z");
      shape.setAttribute("class", "review-fish-shape");
      const eye = document.createElementNS(svgNamespace, "circle");
      eye.setAttribute("cx", "14");
      eye.setAttribute("cy", "20");
      eye.setAttribute("r", "1.8");
      eye.setAttribute("class", "review-fish-eye");
      svg.append(shape, eye);
    } else {
      shape.setAttribute("d", "M2 29c10-4 17-14 24-25 3 8 9 13 17 15 7 2 14-1 19-6-4 13-14 22-27 23-12 1-23-4-33-7Zm24-3c-2-9 1-18 8-24 1 12 5 19 13 22-7 5-14 6-21 2Z");
      shape.setAttribute("class", "review-bird-shape");
      svg.append(shape);
    }
    creature.append(svg);
    creature.addEventListener("animationend", () => creature.remove(), { once: true });
    card.append(creature);
  }
}

function renderReviews(reviews) {
  if (!reviewList || !summary) return;
  latestReviews = reviews;
  if (reviews.length === 0) {
    summary.textContent = "Be the first to share your experience.";
    showMessage(reviewList, "No approved reviews yet. Your review can be the first.");
    return;
  }

  const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  summary.textContent = `${average.toFixed(1)} / 5 \u00b7 ${reviews.length} recent ${reviews.length === 1 ? "review" : "reviews"}`;
  const cards = reviews.map((review, index) => {
    const card = document.createElement("article");
    card.className = review.rating < 2 ? "review-card review-card-low" : "review-card";
    card.style.setProperty("--review-index", String(index));

    const cardTop = document.createElement("div");
    cardTop.className = "review-card-top";

    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    stars.textContent = `${"\u2605".repeat(review.rating)}${"\u2606".repeat(5 - review.rating)}`;

    const score = document.createElement("span");
    score.className = "review-score";
    score.textContent = `${review.rating}/5`;
    cardTop.append(stars, score);

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
    card.tabIndex = 0;
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", `${review.rating} out of 5 stars. Review by ${review.name}.`);
    const animateCreature = () => addCardCreatures(card, review.rating);
    card.addEventListener("pointerenter", animateCreature);
    card.addEventListener("focus", animateCreature);
    card.append(cardTop, message, footer);
    return card;
  });
  pageCapacity = reviewsPerPage();
  const pages = [];
  for (let start = 0; start < cards.length; start += pageCapacity) {
    const page = document.createElement("div");
    page.className = "review-page";
    page.setAttribute("role", "group");
    page.setAttribute("aria-roledescription", "slide");
    const pageCards = cards.slice(start, start + pageCapacity);
    page.setAttribute("aria-label", `Reviews ${start + 1} to ${start + pageCards.length} of ${cards.length}`);
    page.append(...pageCards);
    pages.push(page);
  }
  lastActivePage = -1;
  reviewList.replaceChildren(...pages);
  reviewViewport?.scrollTo({ left: 0, behavior: "auto" });
  updateCarouselControls();
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
      limit(50)
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
        const reviewerName = String(values.get("name") || "").trim().slice(0, 80) || "Customer";
        await addDoc(collection(database, "reviews"), {
          name: reviewerName,
          message: message.slice(0, 1200),
          rating,
          approved: false,
          createdAt: serverTimestamp()
        });
        form.reset();
        const accessKey = window.SITE_CONTENT?.web3FormsAccessKey;
        if (!accessKey || accessKey.startsWith("PASTE_")) {
          if (status) status.textContent = "Your review was submitted and is waiting for approval. Email alerts are not configured yet.";
          return;
        }

        const notification = new FormData();
        
        const adminDashboardUrl = "https://rajkushwaha7584.github.io/Riddhi-Siddhi-RO/admin-reviews.html";
        notification.append("access_key", accessKey);
        notification.append("subject", `Review awaiting approval (${rating}/5)`);
        notification.append("from_name", "Riddhi Siddhi Portfolio");
        notification.append("reviewer", reviewerName);
        notification.append("rating", `${rating} / 5 stars`);
        notification.append("review", message.slice(0, 1200));
        notification.append("admin_dashboard", adminDashboardUrl);
        notification.append("message", [
          "A new customer review is waiting for your approval.",
          `Name: ${reviewerName}`,
          `Rating: ${rating}/5`,
          `Review: ${message.slice(0, 1200)}`,
          `Open the private approval dashboard: ${adminDashboardUrl}`
        ].join("\n\n"));

        try {
          const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: notification });
          const result = await response.json();
          if (!response.ok || !result.success) throw new Error(result.message || "Email notification failed.");
          if (status) status.textContent = "Review submitted! Check your email for the approval link. It will appear publicly after you approve it.";
        } catch (error) {
          console.error("Review saved, but its email notification failed.", error);
          if (status) status.textContent = "Your review was submitted and is waiting for approval, but the email alert could not be sent. Check Web3Forms setup.";
        }
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
