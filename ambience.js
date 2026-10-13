(() => {
  const soundButton = document.querySelector('.sound-toggle');
  const soundState = soundButton?.querySelector('.sound-state');
  const waterSound = new Audio('video/watersound/u_g4b6tnje0y-water-stream-512531.mp3');
  waterSound.loop = true;
  waterSound.preload = 'none';
  waterSound.volume = 0.24;

  function setSoundState(isPlaying, label) {
    soundButton?.setAttribute('aria-pressed', String(isPlaying));
    if (soundState) soundState.textContent = label;
    soundButton?.setAttribute('aria-label', isPlaying ? 'Turn off water stream sound' : 'Turn on water stream sound');
  }

  soundButton?.addEventListener('click', async () => {
    if (!waterSound.paused) {
      waterSound.pause();
      setSoundState(false, 'Off');
      return;
    }

    try {
      await waterSound.play();
      setSoundState(true, 'On');
    } catch (error) {
      setSoundState(false, 'Unavailable');
      soundButton.setAttribute('aria-label', 'Water stream sound could not be played');
      console.info('Water sound could not be played.', error);
    }
  });

  waterSound.addEventListener('error', () => setSoundState(false, 'Unavailable'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) waterSound.pause();
    else if (soundButton?.getAttribute('aria-pressed') === 'true') waterSound.play().catch(() => setSoundState(false, 'Unavailable'));
  });

  const voiceButton = document.querySelector('.voice-toggle');
  const voiceStatus = document.querySelector('.voice-status');
  voiceButton?.addEventListener('click', () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      if (voiceStatus) voiceStatus.textContent = 'Spoken audio is not supported in this browser.';
      return;
    }
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance('जल ही जीवन है।');
    line.lang = 'hi-IN';
    line.rate = 0.82;
    line.pitch = 1;
    line.onstart = () => { if (voiceStatus) voiceStatus.textContent = 'Playing Hindi voice…'; };
    line.onend = () => { if (voiceStatus) voiceStatus.textContent = ''; };
    line.onerror = () => { if (voiceStatus) voiceStatus.textContent = 'Hindi voice could not be played.'; };
    window.speechSynthesis.speak(line);
  });
})();
