// Main Application Controller for "A Roman Witness"
import { NOVEL_META, CHARACTERS, MAP_LOCATIONS, CHAPTERS, TIMELINE, GLOSSARY } from './novelData.js';
import { jerusalemMap } from './mapViewer.js';
import { soundscape } from './soundscape.js';

class App {
  constructor() {
    this.currentChapter = 1;
    this.readerTheme = 'papyrus'; // Default to authentic papyrus
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

  // Render Characters Gallery (Always Full-Color Artwork)
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
      <div class="group relative parchment-panel border border-[#cebf9e] hover:border-[#b38222] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer character-card" data-id="${char.id}">
        <!-- Portrait in Vibrant Full Color -->
        <div class="relative aspect-[3/4] w-full overflow-hidden bg-[#e0d4bc]">
          <img src="${char.image}" alt="${char.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 full-color-artwork" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#201810]/90 via-[#201810]/20 to-transparent"></div>
          
          <div class="absolute top-3 right-3">
            <span class="text-[10px] uppercase font-roman tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#faf5ea]/90 text-[#8a221b] border border-[#c4b699] shadow-sm">
              ${char.faction.split('→')[0].trim()}
            </span>
          </div>

          <div class="absolute bottom-3 left-4 right-4">
            <p class="text-[#e8c87d] text-xs font-roman uppercase tracking-wider">${char.latinTitle}</p>
            <h3 class="text-lg md:text-xl font-roman font-bold text-[#faf5ea] group-hover:text-[#e8c87d] transition-colors">${char.name}</h3>
            <p class="text-[#d8ccb8] text-xs mt-0.5 font-serif-book">${char.role}</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#faf6ee]">
          <p class="text-[#3b2f21] text-xs line-clamp-3 leading-relaxed font-sans-ui">${char.bio}</p>

          <div class="pt-2 border-t border-[#dfd2ba] flex items-center justify-between">
            <span class="text-[11px] text-[#825c11] font-serif-book italic truncate mr-2">“${char.symbol}”</span>
            <span class="text-[#7d1c15] text-xs font-semibold font-roman flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
      <div class="relative bg-[#faf6ee] border-2 border-[#b38222] rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full mx-4 flex flex-col md:flex-row max-h-[90vh]">
        <!-- Close Button -->
        <button id="modal-close-btn" class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#dfd4bc] text-[#3b2f21] hover:text-[#9e2a22] hover:bg-[#faf5ea] flex items-center justify-center border border-[#b38222]/40 text-lg transition-colors font-bold shadow">
          &times;
        </button>

        <!-- Portrait Side (Full Color) -->
        <div class="md:w-5/12 relative h-64 md:h-auto bg-[#e0d4bc] flex-shrink-0">
          <img src="${char.image}" alt="${char.name}" class="w-full h-full object-cover full-color-artwork" />
          <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#201810]/60 via-transparent to-transparent"></div>
        </div>

        <!-- Bio Side -->
        <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-4 text-[#2b2218]">
          <div>
            <span class="px-2.5 py-0.5 text-xs font-roman uppercase tracking-wider bg-[#9e2a22]/15 text-[#7d1c15] border border-[#9e2a22]/30 rounded-full font-semibold">
              ${char.faction}
            </span>
            <h2 class="text-2xl md:text-3xl font-roman-decor font-bold text-[#382618] mt-2">${char.name}</h2>
            <p class="text-[#825c11] text-xs font-roman uppercase tracking-wider">${char.latinTitle}</p>
            <p class="text-[#594936] text-sm font-medium mt-0.5">${char.role}</p>
          </div>

          <!-- Signature Quote -->
          <div class="p-4 rounded-xl bg-[#ede3cb] border-l-4 border-[#9e2a22] text-[#2c2014] italic font-serif-book text-sm leading-relaxed shadow-sm">
            “${char.quote}”
          </div>

          <div>
            <h4 class="text-xs uppercase font-roman tracking-wider text-[#825c11] font-bold mb-1">Character Profile</h4>
            <p class="text-sm leading-relaxed text-[#3b2f21]">${char.bio}</p>
          </div>

          <div>
            <h4 class="text-xs uppercase font-roman tracking-wider text-[#825c11] font-bold mb-1">Dramatic Arc in "A Roman Witness"</h4>
            <p class="text-sm leading-relaxed text-[#3b2f21]">${char.novelArc}</p>
          </div>

          <div class="pt-2 border-t border-[#dfd2ba] text-xs text-[#594936]">
            <span class="font-semibold text-[#825c11]">Signature Symbol:</span> ${char.symbol}
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
      <button class="chapter-nav-item w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${ch.num === this.currentChapter ? 'bg-[#ede3cb] border-[#b38222] text-[#382618] shadow-sm font-semibold' : 'bg-[#faf6ee] border-[#dfd2ba] text-[#594936] hover:bg-[#f3ead8]'}" data-num="${ch.num}">
        <span class="w-6 h-6 rounded-md bg-[#dfd4bc] border border-[#b38222]/40 text-[#6e5318] font-roman font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
          ${ch.num}
        </span>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-roman font-semibold truncate ${ch.num === this.currentChapter ? 'text-[#7d1c15]' : 'text-[#382618]'}">${ch.title}</div>
          <div class="text-[11px] text-[#7a6b57] truncate mt-0.5">${ch.theme}</div>
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
        item.classList.add('bg-[#ede3cb]', 'border-[#b38222]', 'text-[#382618]', 'shadow-sm', 'font-semibold');
        item.classList.remove('bg-[#faf6ee]', 'border-[#dfd2ba]', 'text-[#594936]');
      } else {
        item.classList.remove('bg-[#ede3cb]', 'border-[#b38222]', 'text-[#382618]', 'shadow-sm', 'font-semibold');
        item.classList.add('bg-[#faf6ee]', 'border-[#dfd2ba]', 'text-[#594936]');
      }
    });

    const display = document.getElementById('chapter-content-display');
    if (!display) return;

    display.innerHTML = `
      <div class="space-y-6">
        <!-- Chapter Header -->
        <div class="border-b border-[#cfbf9e] pb-5">
          <div class="flex items-center justify-between text-xs font-roman text-[#825c11] tracking-widest uppercase">
            <span>Chapter ${ch.num} of 20</span>
            <span>Page ${ch.page} in Novel</span>
          </div>
          <h2 class="text-2xl md:text-4xl font-roman-decor font-bold text-[#382618] mt-2">${ch.title}</h2>
          <p class="text-sm font-roman text-[#7d1c15] mt-1">${ch.theme}</p>
        </div>

        <!-- Key Quote Banner -->
        <div class="p-4 rounded-2xl bg-[#ede3cb] border-l-4 border-[#9e2a22] text-[#2c2014] italic font-serif-book text-sm md:text-base leading-relaxed shadow-sm">
          “${ch.keyQuote}”
        </div>

        <!-- Synopsis -->
        <div>
          <h4 class="text-xs uppercase font-roman tracking-wider text-[#825c11] font-bold mb-2">Chapter Overview</h4>
          <p class="text-sm md:text-base leading-relaxed text-[#3b2f21]">${ch.summary}</p>
        </div>

        <!-- Verbatim Excerpt -->
        <div class="pt-4 border-t border-[#dfd2ba]">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2 h-2 rounded-full bg-[#9e2a22]"></span>
            <h4 class="text-xs uppercase font-roman tracking-wider text-[#7d1c15] font-bold">Featured Reading Passage from Novel</h4>
          </div>
          <div class="p-5 md:p-6 rounded-2xl bg-[#faf6ee] border border-[#cfbe9b] font-serif-book text-sm md:text-base leading-loose whitespace-pre-line text-[#231b14] shadow-inner">
            ${ch.excerpt}
          </div>
        </div>

        <!-- Chapter Navigation Footer -->
        <div class="pt-6 border-t border-[#cfbf9e] flex items-center justify-between">
          <button id="btn-prev-ch" class="px-4 py-2 rounded-xl btn-roman-stone text-xs font-roman font-bold disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2" ${num <= 1 ? 'disabled' : ''}>
            &larr; Previous Chapter
          </button>
          <span class="text-xs text-[#6e5d48] font-roman">Chapter ${ch.num} / 20</span>
          <button id="btn-next-ch" class="px-4 py-2 rounded-xl btn-roman-primary text-xs font-roman font-bold disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2" ${num >= 20 ? 'disabled' : ''}>
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
        readerContainer.className = `p-6 md:p-10 rounded-3xl border shadow-xl transition-colors duration-300 reader-theme-${theme}`;
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
      <div class="relative pl-8 md:pl-10 pb-8 border-l-2 border-[#b38222]/50 group">
        <!-- Milestone Icon -->
        <div class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#faf5ea] border-2 border-[#b38222] group-hover:bg-[#b38222] group-hover:scale-125 transition-all shadow-sm"></div>
        
        <!-- Day / Location Badge -->
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full bg-[#9e2a22]/15 text-[#7d1c15] border border-[#9e2a22]/30 text-xs font-roman font-bold">
            ${item.day}
          </span>
          <span class="text-xs font-roman text-[#6e5d48]">
            📍 ${item.location}
          </span>
        </div>

        <h3 class="text-lg md:text-xl font-roman font-bold text-[#382618] mt-1">${item.title}</h3>
        <p class="text-sm text-[#3b2f21] mt-2 leading-relaxed font-sans-ui">${item.desc}</p>
      </div>
    `).join('');
  }

  // Render Roman & Biblical Glossary
  renderGlossary() {
    const container = document.getElementById('glossary-grid');
    if (!container) return;

    container.innerHTML = GLOSSARY.map(item => `
      <div class="p-4 rounded-2xl parchment-panel border border-[#cebf9e] hover:border-[#b38222] transition-colors shadow-sm">
        <div class="flex items-center justify-between">
          <h4 class="font-roman font-bold text-[#382618] text-sm md:text-base">${item.term}</h4>
          <span class="text-[10px] uppercase tracking-wider font-roman px-2 py-0.5 bg-[#ede3cb] text-[#825c11] rounded-md border border-[#cbb898]">
            ${item.category}
          </span>
        </div>
        <p class="text-xs md:text-sm text-[#3b2f21] mt-2 leading-relaxed font-sans-ui">${item.definition}</p>
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
          toggleBtn.classList.add('bg-[#9e2a22]', 'text-[#faf5ea]');
          toggleBtn.classList.remove('text-[#423425]');
          if (soundStatus) soundStatus.textContent = 'Ambient: On';
        } else {
          soundscape.stop();
          this.soundActive = false;
          toggleBtn.classList.remove('bg-[#9e2a22]', 'text-[#faf5ea]');
          toggleBtn.classList.add('text-[#423425]');
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
          b.classList.remove('bg-[#9e2a22]', 'text-[#faf5ea]', 'font-bold');
          b.classList.add('btn-roman-stone');
        });
        e.currentTarget.classList.add('bg-[#9e2a22]', 'text-[#faf5ea]', 'font-bold');
        e.currentTarget.classList.remove('btn-roman-stone');
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
