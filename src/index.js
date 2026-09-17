document.addEventListener('DOMContentLoaded', function () {

      /* ---------- SCROLL REVEAL ---------- */
      const revealEls = document.querySelectorAll('.reveal');
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach((el) => revealObserver.observe(el));

      /* ---------- NAVBAR SHRINK ON SCROLL ---------- */
      const nav = document.getElementById('main-nav');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          nav.classList.add('shadow-lg', 'shadow-black/40');
        } else {
          nav.classList.remove('shadow-lg', 'shadow-black/40');
        }
      });

      /* ---------- EVENT FILTER BAR ---------- */
      const filterTags = document.querySelectorAll('.filter-tag');
      const eventCards = document.querySelectorAll('.event-card');
      const noResults = document.getElementById('no-results');

      filterTags.forEach((tag) => {
        tag.addEventListener('click', () => {
          // Update active styles
          filterTags.forEach((t) => {
            t.classList.remove('active', 'bg-yellow-500', 'text-black');
            t.classList.add('bg-white/[0.04]', 'border', 'border-yellow-500/20', 'text-white/75');
          });
          tag.classList.add('active', 'bg-yellow-500', 'text-black');
          tag.classList.remove('bg-white/[0.04]', 'border', 'border-yellow-500/20', 'text-white/75');

          const filter = tag.dataset.filter;
          let visibleCount = 0;

          eventCards.forEach((card) => {
            const matches = filter === 'all' || card.dataset.category === filter;
            if (matches) {
              card.style.display = '';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          });

          noResults.classList.toggle('hidden', visibleCount > 0);
        });
      });

      /* ---------- LIVE COUNTDOWN TIMER ---------- */
      // Target: 28 days from now (matches "Join the AI Summit" banner)
      const countdownTarget = new Date();
      countdownTarget.setDate(countdownTarget.getDate() + 28);
      countdownTarget.setHours(countdownTarget.getHours() + 14);
      countdownTarget.setMinutes(countdownTarget.getMinutes() + 32);

      const daysEl = document.getElementById('cd-days');
      const hoursEl = document.getElementById('cd-hours');
      const minsEl = document.getElementById('cd-mins');
      const secsEl = document.getElementById('cd-secs');

      function pad(num) {
        return String(num).padStart(2, '0');
      }

      function updateCountdown() {
        const now = new Date();
        let diff = Math.max(0, countdownTarget - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        daysEl.textContent = pad(days);
        hoursEl.textContent = pad(hours);
        minsEl.textContent = pad(mins);

        // Pulse animation on seconds change
        secsEl.textContent = pad(secs);
        secsEl.classList.remove('count-pulse');
        void secsEl.offsetWidth;
        secsEl.classList.add('count-pulse');
      }

      updateCountdown();
      setInterval(updateCountdown, 1000);

    });