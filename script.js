// Basic interactions: music toggle, confetti, floating hearts, wishes in localStorage, surprise open

document.addEventListener('DOMContentLoaded', () => {
  // Music toggle
  const musicBtn = document.querySelectorAll('#music-toggle');
  const audioElems = document.querySelectorAll('#bg-music');
  // choose first audio element if present
  const audio = audioElems.length ? audioElems[0] : null;
  if (musicBtn.length && audio) {
    musicBtn.forEach(btn => {
      btn.addEventListener('click', () => {
        if (audio.paused) {
          audio.play().catch(()=>{ /* autoplay might be blocked */ });
          btn.textContent = 'Pause Music';
        } else {
          audio.pause();
          btn.textContent = 'Play Music';
        }
      });
    });
  }

  // Confetti implementation (simple)
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confBtn = document.getElementById('confetti-btn');
  let confettiCtx, confettiPieces = [], confettiRunning = false;

  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCtx = confettiCanvas.getContext('2d');
    window.addEventListener('resize', () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    });

    function spawnConfetti(amount = 80) {
      confettiPieces = [];
      const colors = ['#FF7BB2','#FFD1E8','#FFD166','#9AE6B4','#93C5FD'];
      for (let i=0;i<amount;i++){
        confettiPieces.push({
          x: Math.random()*confettiCanvas.width,
          y: Math.random()*-confettiCanvas.height*0.6,
          w: 6 + Math.random()*8,
          h: 8 + Math.random()*10,
          vx: -1 + Math.random()*2,
          vy: 2 + Math.random()*4,
          r: Math.random()*360,
          color: colors[Math.floor(Math.random()*colors.length)]
        });
      }
      if (!confettiRunning) {
        confettiRunning = true;
        requestAnimationFrame(confettiLoop);
      }
    }

    function confettiLoop() {
      confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
      for (let p of confettiPieces){
        confettiCtx.save();
        confettiCtx.translate(p.x,p.y);
        confettiCtx.rotate(p.r * Math.PI/180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        confettiCtx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.r += 4;
      }
      // remove pieces off-screen
      confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 50);
      if (confettiPieces.length) {
        requestAnimationFrame(confettiLoop);
      } else {
        confettiRunning = false;
        confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
      }
    }

    if (confBtn) confBtn.addEventListener('click', () => {
      spawnConfetti(120);
    });
  }

  // Floating hearts generator on Home page
  const heartsContainer = document.querySelector('.floating-hearts');
  if (heartsContainer) {
    setInterval(() => {
      const heart = document.createElement('div');
      heart.className = 'f-heart';
      const size = 12 + Math.random()*18;
      heart.style.width = heart.style.height = size + 'px';
      heart.style.left = Math.random()*90 + '%';
      heart.style.opacity = (0.6 + Math.random()*0.4);
      heartsContainer.appendChild(heart);
      heart.animate([
        { transform: 'translateY(0) scale(1)', opacity: heart.style.opacity },
        { transform: 'translateY(-160px) scale(1.3)', opacity: 0 }
      ], { duration: 3000 + Math.random()*2500, easing: 'ease-out' });
      setTimeout(()=>heart.remove(), 6000);
    }, 700);
  }

  // Wishes: simple localStorage-backed list
  const postBtn = document.getElementById('post-wish');
  const wishesList = document.getElementById('wishes-list');

  function renderWishes() {
    if (!wishesList) return;
    const arr = JSON.parse(localStorage.getItem('shaju_wishes') || '[]');
    wishesList.innerHTML = arr.map(w => {
      const when = new Date(w.t).toLocaleString();
      return `<div class="wish-card"><strong>${escapeHtml(w.name || 'Anonymous')}</strong> <span style="color:var(--muted);font-size:.85rem">• ${when}</span><p style="margin:.5rem 0 0">${escapeHtml(w.text)}</p></div>`;
    }).join('');
  }
  renderWishes();

  if (postBtn) {
    postBtn.addEventListener('click', () => {
      const name = document.getElementById('wish-name').value.trim();
      const text = document.getElementById('wish-text').value.trim();
      if (!text) {
        alert('Please write a short wish!');
        return;
      }
      const arr = JSON.parse(localStorage.getItem('shaju_wishes') || '[]');
      arr.unshift({ name: name || 'Anonymous', text, t: Date.now() });
      localStorage.setItem('shaju_wishes', JSON.stringify(arr));
      document.getElementById('wish-name').value = '';
      document.getElementById('wish-text').value = '';
      renderWishes();
      // small confetti
      if (confBtn) confBtn.click();
    });
  }

  // Surprise open
  const openBtn = document.getElementById('open-gift');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      const secret = document.getElementById('secret-message');
      if (secret) {
        secret.classList.toggle('hidden');
        // trigger confetti big
        const cbtn = document.getElementById('confetti-btn');
        if (cbtn) cbtn.click();
      }
    });
  }

  // small helper
  function escapeHtml(unsafe) {
    return unsafe
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }
});
