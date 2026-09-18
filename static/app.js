(() => {
  const $ = (id) => document.getElementById(id);

  function pct(t, duration) {
    return `${(t / duration) * 100}%`;
  }

  function renderLanes(session, lanesEl) {
    const duration = session.duration_sec;
    const colors = Object.fromEntries(session.speakers.map((s) => [s.id, s.color]));
    lanesEl.innerHTML = "";
    const stack = document.createElement("div");
    stack.style.position = "relative";

    session.speakers.forEach((spk) => {
      const row = document.createElement("div");
      row.className = "lane";
      const name = document.createElement("div");
      name.className = "lane-name";
      name.textContent = spk.name;
      const track = document.createElement("div");
      track.className = "lane-track";
      session.segments
        .filter((seg) => seg.speaker === spk.id)
        .forEach((seg) => {
          const bar = document.createElement("div");
          bar.className = "lane-seg";
          bar.style.left = pct(seg.start, duration);
          bar.style.width = pct(seg.end - seg.start, duration);
          bar.style.background = colors[spk.id];
          bar.title = `${seg.text} (${seg.start.toFixed(2)}–${seg.end.toFixed(2)}s)`;
          track.appendChild(bar);
        });
      session.overlaps.forEach((ov) => {
        if (!ov.speakers.includes(spk.id)) return;
        const band = document.createElement("div");
        band.className = "overlap-band";
        band.style.left = pct(ov.start, duration);
        band.style.width = pct(ov.end - ov.start, duration);
        track.appendChild(band);
      });
      row.append(name, track);
      stack.appendChild(row);
    });
    lanesEl.appendChild(stack);
  }

  function renderTranscript(session, el, blended) {
    el.innerHTML = "";
    if (blended) {
      const p = document.createElement("div");
      p.className = "blended";
      p.textContent = session.blended;
      el.appendChild(p);
      return;
    }
    const names = Object.fromEntries(session.speakers.map((s) => [s.id, s.name]));
    const colors = Object.fromEntries(session.speakers.map((s) => [s.id, s.color]));
    session.segments.forEach((seg, i) => {
      const card = document.createElement("div");
      card.className = "turn";
      card.dataset.index = String(i);
      card.style.borderLeftColor = colors[seg.speaker];
      card.innerHTML = `<div class="who">${names[seg.speaker]} · ${seg.start.toFixed(2)}–${seg.end.toFixed(2)}s</div>${seg.text}`;
      el.appendChild(card);
    });
  }

  async function mount(opts) {
    const session = await fetch("/api/session").then((r) => r.json());
    const lanesEl = $("lanes");
    const transcriptEl = $("transcript");
    const player = $("player");
    const playBtn = $("playBtn");
    const toggleBtn = $("toggleBtn");
    const clock = $("clock");
    const status = $("status");
    if (status) status.textContent = session.hint || "Demo mode";

    renderLanes(session, lanesEl);
    let blended = false;
    renderTranscript(session, transcriptEl, blended);

    const tracks = lanesEl.querySelectorAll(".lane-track");
    function setHead(t) {
      const frac = Math.min(t / session.duration_sec, 1);
      tracks.forEach((track) => {
        let head = track.querySelector(".playhead");
        if (!head) {
          head = document.createElement("div");
          head.className = "playhead";
          track.appendChild(head);
        }
        head.style.left = `${frac * 100}%`;
      });
      clock.textContent = `${t.toFixed(2)}s`;
      transcriptEl.querySelectorAll(".turn").forEach((card, i) => {
        const seg = session.segments[i];
        card.classList.toggle("active", t >= seg.start && t <= seg.end);
      });
    }

    function togglePlay() {
      if (player.paused) player.play();
      else player.pause();
    }

    playBtn.addEventListener("click", togglePlay);
    player.addEventListener("play", () => {
      playBtn.textContent = "Pause";
    });
    player.addEventListener("pause", () => {
      playBtn.textContent = "Play mix";
    });
    player.addEventListener("timeupdate", () => setHead(player.currentTime));
    player.addEventListener("ended", () => setHead(session.duration_sec));

    toggleBtn.addEventListener("click", () => {
      blended = !blended;
      toggleBtn.textContent = blended ? "Show speaker transcript" : "Show blended transcript";
      renderTranscript(session, transcriptEl, blended);
    });

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    });

    setHead(0);
    if (opts && opts.autoplay) {
      /* showcase stays click-to-play */
    }
  }

  window.NemoDiar = {
    mountShowcase: () => mount({ autoplay: false }),
    mountLab: () => mount({ autoplay: false }),
  };
})();
