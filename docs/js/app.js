// Main Application Controller for "A Roman Witness"
import { NOVEL_META, CHARACTERS, MAP_LOCATIONS, CHAPTERS, TIMELINE, GLOSSARY } from './novelData.js';
import { jerusalemMap } from './mapViewer.js';
import { soundscape } from './soundscape.js';

class App {
  constructor() {
    this.currentChapter = 1;
    this.readerTheme = 'night'; // 'night', 'papyrus', 'sepia'
    this.readerFontSize = 16;
    this.activeFaction = 'all';
    this.soundActive = false;
  }

  init() {
    this.renderCharacters();
    this.initMap();
    this.renderChapterList();
    this.loadChapter(1);
    this.renderTimeline();
    this.renderGlossary();
    this.bindGlobalEvents();
    this.bindReaderControls();
    this.bindSoundControls();
  }

  // Initialize Interactive Jerusalem Map
  initMap() {
    jerusalemMap.init('map-viewport', 'map-dossier');

    // Filter tabs for Map
    document.querySelectorAll('.map-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        jerusalemMap.filterLocations(e.currentTarget.dataset.filter);
      });
    });
  }

  // Render Characters Gallery
  renderCharacters() {
    const grid = document.getElementById('characters-grid');
    if (!grid) return;

    const filtered = CHARACTERS.filter(char => {
      if (this.activeFaction === 'all') return true;
      if (this.activeFaction === 'roman') {
        return char.faction.includes('Roman') || char.faction.includes('Authority');
      }
      if (this.activeFaction === 'disciples') {
        return char.faction.includes('Disciples') || char.faction.includes('Kingdom') || char.faction.includes('Way');
      }
      if (this.activeFaction === 'temple') {
        return char.faction.includes('Temple');
      }
      if (this.activeFaction === 'women') {
        return char.faction.includes('Women');
      }
      return true;
    });

    grid.innerHTML = filtered.map(char => `
      <div class="group relative bg-stone-900/80 border border-stone-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer character-card" data-id="${char.id}">
        <!-- Portrait -->
        <div class="relative aspect-[3/4] w-full overflow-hidden bg-stone-950">
          <img src="${char.image}" alt="${char.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
          
          <div class="absolute top-3 right-3">
            <span class="text-[10px] uppercase font-roman tracking-wider font-semibold px-2 py-0.5 rounded-full bg-stone-950/80 text-amber-300 border border-amber-500/30">
              ${char.faction.split('→')[0].trim()}
            </span>
          </div>

          <div class="absolute bottom-3 left-4 right-4">
            <p class="text-amber-400/90 text-xs font-roman uppercase tracking-wider">${char.latinTitle}</p>
            <h3 class="text-lg md:text-xl font-roman font-bold text-amber-100 group-hover:text-amber-300 transition-colors">${char.name}</h3>
            <p class="text-stone-400 text-xs mt-0.5">${char.role}</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <p class="text-stone-300 text-xs line-clamp-3 leading-relaxed">${char.bio}</p>

          <div class="pt-2 border-t border-stone-800/80 flex items-center justify-between">
            <span class="text-[11px] text-amber-500/80 font-roman italic truncate mr-2">“${char.symbol}”</span>
            <span class="text-amber-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Dossier &rarr;
            </span>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to cards
    grid.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        this.openCharacterModal(card.dataset.id);
      });
    });
  }

  // Character Detail Modal
  openCharacterModal(id) {
    const char = CHARACTERS.find(c => c.id === id);
    if (!char) return;

    const modal = document.getElementById('character-modal');
    const container = document.getElementById('character-modal-content');
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="relative bg-stone-950 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full mx-4 flex flex-col md:flex-row max-h-[90vh]">
        <!-- Close Button -->
        <button id="modal-close-btn" class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-900/90 text-amber-300 hover:text-white flex items-center justify-center border border-amber-500/30 text-lg transition-colors">
          &times;
        </button>

        <!-- Portrait Side -->
        <div class="md:w-5/12 relative h-64 md:h-auto bg-stone-900 flex-shrink-0">
          <img src="${char.image}" alt="${char.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-950 via-transparent to-transparent"></div>
        </div>

        <!-- Bio Side -->
        <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-4 text-stone-300">
          <div>
            <span class="px-2.5 py-0.5 text-xs font-roman uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-semibold">
              ${char.faction}
            </span>
            <h2 class="text-2xl md:text-3xl font-roman-decor font-bold text-amber-100 mt-2">${char.name}</h2>
            <p class="text-amber-400 text-xs font-roman uppercase tracking-wider">${char.latinTitle}</p>
            <p class="text-stone-400 text-sm font-medium mt-0.5">${char.role}</p>
          </div>

          <!-- Signature Quote -->
          <div class="p-4 rounded-xl bg-amber-950/20 border-l-2 border-amber-500 text-stone-200 italic font-serif-book text-sm leading-relaxed">
            “${char.quote}”
          </div>

          <div>
            <h4 class="text-xs uppercase font-roman tracking-wider text-amber-500 font-bold mb-1">Character Profile</h4>
            <p class="text-sm leading-relaxed text-stone-300">${char.bio}</p>
          </div>

          <div>
            <h4 class="text-xs uppercase font-roman tracking-wider text-amber-500 font-bold mb-1">Dramatic Arc in "A Roman Witness"</h4>
            <p class="text-sm leading-relaxed text-stone-300">${char.novelArc}</p>
          </div>

          <div class="pt-2 border-t border-stone-800 text-xs text-amber-300/80">
            <span class="font-semibold text-amber-400">Signature Symbol:</span> ${char.symbol}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };
  }

  // Chapter Guide & Reader
  renderChapterList() {
    const list = document.getElementById('chapter-nav-list');
    if (!list) return;

    list.innerHTML = CHAPTERS.map(ch => `
      <button class="chapter-nav-item w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${ch.num === this.currentChapter ? 'bg-amber-950/30 border-amber-500 text-amber-200' : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'}" data-num="${ch.num}">
        <span class="w-6 h-6 rounded-md bg-stone-950 border border-amber-500/30 text-amber-400 font-roman font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
          ${ch.num}
        </span>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-roman font-semibold truncate ${ch.num === this.currentChapter ? 'text-amber-200' : 'text-stone-300'}">${ch.title}</div>
          <div class="text-[11px] text-stone-500 truncate mt-0.5">${ch.theme}</div>
        </div>
      </button>
    `).join('');

    list.querySelectorAll('.chapter-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const num = parseInt(item.dataset.num, 10);
        this.loadChapter(num);
      });
    });
  }

  loadChapter(num) {
    this.currentChapter = num;
    const ch = CHAPTERS.find(c => c.num === num);
    if (!ch) return;

    // Update active state in sidebar list
    document.querySelectorAll('.chapter-nav-item').forEach(item => {
      const itemNum = parseInt(item.dataset.num, 10);
      if (itemNum === num) {
        item.classList.add('bg-amber-950/30', 'border-amber-500', 'text-amber-200');
        item.classList.remove('bg-stone-900/60', 'border-stone-800/80', 'text-stone-400');
      } else {
        item.classList.remove('bg-amber-950/30', 'border-amber-500', 'text-amber-200');
        item.classList.add('bg-stone-900/60', 'border-stone-800/80', 'text-stone-400');
      }
    });

    const display = document.getElementById('chapter-content-display');
    if (!display) return;

    display.innerHTML = `
      <div class="space-y-6">
        <!-- Chapter Header -->
        <div class="border-b border-amber-500/20 pb-5">
          <div class="flex items-center justify-between text-xs font-roman text-amber-500 tracking-widest uppercase">
            <span>Chapter ${ch.num} of 20</span>
            <span>Page ${ch.page} in Novel</span>
          </div>
          <h2 class="text-2xl md:text-4xl font-roman-decor font-bold text-amber-100 mt-2">${ch.title}</h2>
          <p class="text-sm font-roman text-amber-400/80 mt-1">${ch.theme}</p>
        </div>

        <!-- Key Quote Banner -->
        <div class="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-stone-200 italic font-serif-book text-sm md:text-base leading-relaxed">
          “${ch.keyQuote}”
        </div>

        <!-- Synopsis -->
        <div>
          <h4 class="text-xs uppercase font-roman tracking-wider text-amber-500 font-bold mb-2">Chapter Overview</h4>
          <p class="text-sm md:text-base leading-relaxed opacity-90">${ch.summary}</p>
        </div>

        <!-- Verbatim Excerpt -->
        <div class="pt-4 border-t border-stone-800">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <h4 class="text-xs uppercase font-roman tracking-wider text-amber-400 font-bold">Featured Reading Passage from Novel</h4>
          </div>
          <div class="p-5 md:p-6 rounded-2xl bg-stone-950/50 border border-amber-500/20 font-serif-book text-sm md:text-base leading-loose whitespace-pre-line opacity-95 shadow-inner">
            ${ch.excerpt}
          </div>
        </div>

        <!-- Chapter Navigation Footer -->
        <div class="pt-6 border-t border-amber-500/20 flex items-center justify-between">
          <button id="btn-prev-ch" class="px-4 py-2 rounded-xl border border-stone-800 hover:border-amber-500 text-xs font-roman text-amber-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2" ${num <= 1 ? 'disabled' : ''}>
            &larr; Previous Chapter
          </button>
          <span class="text-xs text-stone-400 font-roman">Chapter ${ch.num} / 20</span>
          <button id="btn-next-ch" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs font-roman disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2" ${num >= 20 ? 'disabled' : ''}>
            Next Chapter &rarr;
          </button>
        </div>
      </div>
    `;

    // Hook prev / next
    const btnPrev = document.getElementById('btn-prev-ch');
    const btnNext = document.getElementById('btn-next-ch');
    if (btnPrev) btnPrev.addEventListener('click', () => this.loadChapter(num - 1));
    if (btnNext) btnNext.addEventListener('click', () => this.loadChapter(num + 1));
  }

  // Reader Customization Controls
  bindReaderControls() {
    const readerContainer = document.getElementById('reader-box');
    if (!readerContainer) return;

    // Theme selector
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.readerTheme = theme;
        readerContainer.className = `p-6 md:p-10 rounded-3xl border shadow-2xl transition-colors duration-300 reader-theme-${theme}`;
      });
    });

    // Font size controls
    const btnFontPlus = document.getElementById('font-size-plus');
    const btnFontMinus = document.getElementById('font-size-minus');
    if (btnFontPlus) {
      btnFontPlus.addEventListener('click', () => {
        this.readerFontSize = Math.min(24, this.readerFontSize + 2);
        readerContainer.style.fontSize = `${this.readerFontSize}px`;
      });
    }
    if (btnFontMinus) {
      btnFontMinus.addEventListener('click', () => {
        this.readerFontSize = Math.max(13, this.readerFontSize - 2);
        readerContainer.style.fontSize = `${this.readerFontSize}px`;
      });
    }
  }

  // Render Holy Week Timeline
  renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = TIMELINE.map((item, index) => `
      <div class="relative pl-8 md:pl-10 pb-8 border-l-2 border-amber-500/30 group">
        <!-- Milestone Icon -->
        <div class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-stone-950 border-2 border-amber-500 group-hover:bg-amber-500 group-hover:scale-125 transition-all"></div>
        
        <!-- Day / Location Badge -->
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-roman font-bold">
            ${item.day}
          </span>
          <span class="text-xs font-roman text-stone-400">
            📍 ${item.location}
          </span>
        </div>

        <h3 class="text-lg md:text-xl font-roman font-bold text-amber-100 mt-1">${item.title}</h3>
        <p class="text-sm text-stone-300 mt-2 leading-relaxed">${item.desc}</p>
      </div>
    `).join('');
  }

  // Render Roman & Biblical Glossary
  renderGlossary() {
    const container = document.getElementById('glossary-grid');
    if (!container) return;

    container.innerHTML = GLOSSARY.map(item => `
      <div class="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition-colors shadow-lg">
        <div class="flex items-center justify-between">
          <h4 class="font-roman font-bold text-amber-200 text-sm md:text-base">${item.term}</h4>
          <span class="text-[10px] uppercase tracking-wider font-roman px-2 py-0.5 bg-amber-950/60 text-amber-400 rounded-md border border-amber-500/20">
            ${item.category}
          </span>
        </div>
        <p class="text-xs md:text-sm text-stone-300 mt-2 leading-relaxed">${item.definition}</p>
      </div>
    `).join('');
  }

  // Soundscape toggles & volume
  bindSoundControls() {
    const toggleBtn = document.getElementById('soundscape-toggle');
    const volumeSlider = document.getElementById('soundscape-volume');
    const soundStatus = document.getElementById('soundscape-status');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (!this.soundActive) {
          soundscape.start();
          this.soundActive = true;
          toggleBtn.classList.add('bg-amber-500', 'text-stone-950');
          toggleBtn.classList.remove('bg-stone-900', 'text-amber-300');
          if (soundStatus) soundStatus.textContent = 'Ambient: On';
        } else {
          soundscape.stop();
          this.soundActive = false;
          toggleBtn.classList.remove('bg-amber-500', 'text-stone-950');
          toggleBtn.classList.add('bg-stone-900', 'text-amber-300');
          if (soundStatus) soundStatus.textContent = 'Ambient: Off';
        }
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        soundscape.setVolume(parseFloat(e.target.value));
      });
    }
  }

  // Global filters & mobile menu
  bindGlobalEvents() {
    // Character faction filter buttons
    document.querySelectorAll('.char-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.char-filter-btn').forEach(b => {
          b.classList.remove('bg-amber-600', 'text-stone-950', 'font-bold');
          b.classList.add('bg-stone-900', 'text-stone-300');
        });
        e.currentTarget.classList.add('bg-amber-600', 'text-stone-950', 'font-bold');
        e.currentTarget.classList.remove('bg-stone-900', 'text-stone-300');
        this.activeFaction = e.currentTarget.dataset.faction;
        this.renderCharacters();
      });
    });

    // Mobile nav hamburger toggle
    const navToggle = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
        });
      });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  openChapter(num) {
    this.loadChapter(num);
    const readerEl = document.getElementById('reader');
    if (readerEl) {
      readerEl.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

const app = new App();
window.appReader = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
