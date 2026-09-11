// Interactive Ancient Jerusalem Map Controller
import { MAP_LOCATIONS } from './novelData.js';

class JerusalemMapViewer {
  constructor() {
    this.locations = MAP_LOCATIONS;
    this.activeLocation = null;
    this.currentFilter = 'all';
    this.zoom = 1;
    this.minZoom = 0.8;
    this.maxZoom = 2.4;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.container = null;
    this.mapWrapper = null;
    this.markersContainer = null;
    this.drawer = null;
  }

  init(containerId, drawerId) {
    this.container = document.getElementById(containerId);
    this.drawer = document.getElementById(drawerId);
    if (!this.container) return;

    this.mapWrapper = this.container.querySelector('.map-wrapper');
    this.markersContainer = this.container.querySelector('.markers-container');

    this.bindEvents();
    this.renderMarkers();
    
    // Select first location by default (Golgotha)
    setTimeout(() => {
      this.selectLocation(this.locations[0].id, false);
    }, 400);
  }

  bindEvents() {
    // Zoom buttons
    const btnZoomIn = document.getElementById('map-zoom-in');
    const btnZoomOut = document.getElementById('map-zoom-out');
    const btnZoomReset = document.getElementById('map-zoom-reset');

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.setZoom(this.zoom + 0.25));
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.setZoom(this.zoom - 0.25));
    if (btnZoomReset) btnZoomReset.addEventListener('click', () => this.resetView());

    // Panning with mouse
    this.container.addEventListener('mousedown', (e) => {
      if (e.target.closest('.map-marker') || e.target.closest('.map-controls')) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
      }
    });

    // Touch support for mobile panning
    let touchStartDist = 0;
    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.panX;
        this.startY = e.touches[0].clientY - this.panY;
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        this.panX = e.touches[0].clientX - this.startX;
        this.panY = e.touches[0].clientY - this.startY;
        this.updateTransform();
      }
    }, { passive: true });

    this.container.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Mousewheel zooming
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      this.setZoom(this.zoom + delta);
    }, { passive: false });
  }

  setZoom(newZoom) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    this.updateTransform();
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
  }

  updateTransform() {
    if (this.mapWrapper) {
      this.mapWrapper.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
  }

  filterLocations(filterType) {
    this.currentFilter = filterType;
    const filterButtons = document.querySelectorAll('.map-filter-btn');
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === filterType) {
        btn.classList.add('bg-[#9e2a22]', 'text-[#faf5ea]', 'font-bold');
        btn.classList.remove('btn-roman-stone');
      } else {
        btn.classList.remove('bg-[#9e2a22]', 'text-[#faf5ea]', 'font-bold');
        btn.classList.add('btn-roman-stone');
      }
    });

    this.renderMarkers();
  }

  renderMarkers() {
    if (!this.markersContainer) return;
    this.markersContainer.innerHTML = '';

    const visibleLocations = this.locations.filter(loc => {
      if (this.currentFilter === 'all') return true;
      if (this.currentFilter === 'passion') {
        return ['golgotha', 'tomb', 'viadolorosa', 'gethsemane'].includes(loc.id);
      }
      if (this.currentFilter === 'power') {
        return ['praetorium', 'antonia', 'temple'].includes(loc.id);
      }
      if (this.currentFilter === 'underground') {
        return ['upperroom', 'tannershouse', 'siloampool', 'bethany', 'city_of_david'].includes(loc.id);
      }
      return true;
    });

    visibleLocations.forEach(loc => {
      const marker = document.createElement('button');
      marker.className = `map-marker group p-1 ${this.activeLocation?.id === loc.id ? 'active' : ''}`;
      marker.style.left = `${loc.coords.x}%`;
      marker.style.top = `${loc.coords.y}%`;
      marker.title = loc.title;
      marker.setAttribute('aria-label', loc.title);

      marker.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="marker-pulse"></div>
          <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#c7952e] via-[#9e7019] to-[#593907] border-2 border-[#fdefc7] shadow-xl flex items-center justify-center text-[#faf5ea] font-roman font-bold text-xs shadow-black/50 transition-transform group-hover:scale-110">
            ${loc.title.substring(0, 1)}
          </div>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <span class="bg-[#faf6ee] text-[#382618] text-xs font-roman font-bold px-2.5 py-1 rounded-md border border-[#b38222] shadow-xl whitespace-nowrap">
              ${loc.title}
            </span>
            <div class="w-1.5 h-1.5 bg-[#faf6ee] rotate-45 -mt-1 border-r border-b border-[#b38222]"></div>
          </div>
        </div>
      `;

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectLocation(loc.id, true);
      });

      this.markersContainer.appendChild(marker);
    });
  }

  selectLocation(id, smoothPan = true) {
    const loc = this.locations.find(l => l.id === id);
    if (!loc) return;
    this.activeLocation = loc;

    // Update active marker styles
    document.querySelectorAll('.map-marker').forEach(m => m.classList.remove('active'));
    const markers = this.markersContainer.querySelectorAll('.map-marker');
    markers.forEach(m => {
      if (m.title === loc.title) m.classList.add('active');
    });

    // Optional pan to marker
    if (smoothPan && this.container) {
      const rect = this.container.getBoundingClientRect();
      const targetX = (loc.coords.x / 100) * this.mapWrapper.offsetWidth;
      const targetY = (loc.coords.y / 100) * this.mapWrapper.offsetHeight;
      this.panX = (rect.width / 2) - (targetX * this.zoom);
      this.panY = (rect.height / 2) - (targetY * this.zoom);
      this.updateTransform();
    }

    this.renderDrawer(loc);
  }

  renderDrawer(loc) {
    if (!this.drawer) return;

    this.drawer.innerHTML = `
      <div class="h-full flex flex-col parchment-panel border border-[#cebf9e] rounded-3xl overflow-hidden shadow-xl">
        <!-- Header Image with Badge (Full Vibrant Color) -->
        <div class="relative h-48 sm:h-56 w-full overflow-hidden bg-[#ded0b6] border-b border-[#cfbe9b]">
          <img src="${loc.image}" alt="${loc.title}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105 full-color-artwork" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#201810]/80 via-transparent to-transparent"></div>
          
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 text-xs font-roman uppercase tracking-wider bg-[#9e2a22] text-[#faf5ea] font-bold rounded-full shadow-md">
              ${loc.badge}
            </span>
          </div>

          <div class="absolute bottom-3 left-4 right-4">
            <p class="text-[#e8c87d] text-xs font-roman tracking-wider uppercase">${loc.latinTitle}</p>
            <h3 class="text-xl sm:text-2xl font-roman-decor font-bold text-[#faf5ea] leading-tight drop-shadow">${loc.title}</h3>
          </div>
        </div>

        <!-- Content Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-[#33271b] text-sm bg-[#faf6ee]">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#825c11] font-roman">Historical Significance</span>
            <p class="mt-1 leading-relaxed text-[#3b2f21] font-sans-ui">${loc.summary}</p>
          </div>

          <!-- Direct Quote from Book -->
          <div class="p-3.5 rounded-xl bg-[#ede3cb] border-l-4 border-[#9e2a22] text-[#2c2014] italic font-serif-book text-xs sm:text-sm leading-relaxed shadow-sm">
            “${loc.bookQuote}”
            <div class="mt-2 text-right not-italic text-xs font-roman text-[#7d1c15] font-bold">
              — ${loc.chapterRef} (Page ${loc.page})
            </div>
          </div>

          <!-- Characters at Location -->
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#825c11] font-roman">Key Figures at Location</span>
            <div class="mt-2 flex flex-wrap gap-1.5">
              ${loc.charactersPresent.map(char => `
                <span class="px-2 py-0.5 rounded-md bg-[#ede4d0] border border-[#cbb898] text-[#382618] text-xs font-serif-book">
                  ${char}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Jump to Book Reader -->
          <div class="pt-2">
            <a href="#reader" data-chapter="${loc.page}" class="jump-to-scene-btn flex items-center justify-center gap-2 w-full py-2.5 px-4 btn-roman-primary font-roman font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all">
              <span>Read Scene in Chapter Reader</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;

    // Hook up jump-to-scene button
    const jumpBtn = this.drawer.querySelector('.jump-to-scene-btn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        // Find which chapter corresponds to this page/chapterRef
        const match = this.locations.find(l => l.id === loc.id);
        if (match && window.appReader) {
          const chNum = parseInt(match.chapterRef.match(/\d+/)?.[0] || '1', 10);
          window.appReader.openChapter(chNum);
        }
      });
    }
  }
}

export const jerusalemMap = new JerusalemMapViewer();

window.jerusalemMap = jerusalemMap;
