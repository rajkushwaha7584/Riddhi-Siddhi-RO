/* Water journey media section. Keep the video path relative for GitHub Pages. */
const gallery = document.querySelector('.image-river');

if (gallery) {
  gallery.insertAdjacentHTML('beforebegin', `
    <section class="water-story" id="water-journey" aria-labelledby="water-story-title">
      <div class="section-wrap water-story-inner">
        <div class="water-story-heading">
          <div>
            <div class="section-kicker">FROM PURIFIER TO FIRST SIP</div>
            <h2 id="water-story-title">A little more care<br><span>in every glass.</span></h2>
            <p>See the journey from clean water to a refreshing sip.</p>
          </div>
          <a class="text-link" href="#contact">Ask about your water <span>↗</span></a>
        </div>
        <div class="water-story-grid">
          <div class="water-story-steps">
            <article><span class="story-step-icon">01</span><div><h3>Purify</h3><p>RO + UV purification selected for the source water and the people using it.</p></div></article>
            <article><span class="story-step-icon">02</span><div><h3>Check</h3><p>Test water quality. The pH display is an example, not a live reading.</p></div></article>
            <article><span class="story-step-icon">03</span><div><h3>Fill & enjoy</h3><p>Watch the video to see water drawn from a purifier and enjoyed as a drink.</p></div></article>
            <div class="story-ph-card"><span>EXAMPLE pH</span><strong>7.0 <small>NEUTRAL</small></strong><div class="ph-scale"><b></b></div><div class="ph-range"><span>0 acidic</span><span>7 neutral</span><span>14 alkaline</span></div></div>
            <p class="ph-note">Illustration only—not a live measurement. pH alone does not confirm drinking-water safety; water needs proper testing. <a href="https://www.who.int/publications/m/item/chemical-fact-sheets--ph" target="_blank" rel="noreferrer">WHO pH facts ↗</a></p>
          </div>
          <div class="water-story-stage water-video-stage">
            <div class="story-stage-label"><span class="story-live-dot"></span> THE WATER JOURNEY</div>
            <video class="water-story-video" controls muted loop playsinline preload="metadata" aria-label="Video showing the water drinking scene">
              <source src="video/gemini_generated_video_671da564.mp4" type="video/mp4">
              Your browser does not support embedded video. <a href="video/gemini_generated_video_671da564.mp4">Open the water journey video</a>.
            </video>
          </div>
        </div>
      </div>
    </section>`);

  const waterVideo = document.querySelector('.water-story-video');
  if (waterVideo && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    waterVideo.autoplay = true;
    waterVideo.play().catch(() => {});
  }
}
