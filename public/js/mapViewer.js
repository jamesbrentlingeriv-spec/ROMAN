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
        btn.classList.add('bg-amber-600', 'text-stone-900', 'font-bold');
        btn.classList.remove('bg-stone-800', 'text-amber-200');
      } else {
        btn.classList.remove('bg-amber-600', 'text-stone-900', 'font-bold');
        btn.classList.add('bg-stone-800', 'text-amber-200');
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
          <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 border-2 border-amber-200 shadow-xl flex items-center justify-center text-stone-950 font-roman font-bold text-xs shadow-black/80 transition-transform group-hover:scale-110">
            ${loc.title.substring(0, 1)}
          </div>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <span class="bg-stone-950/95 text-amber-200 text-xs font-roman px-2.5 py-1 rounded border border-amber-500/50 shadow-2xl whitespace-nowrap">
              ${loc.title}
            </span>
            <div class="w-1.5 h-1.5 bg-stone-950 rotate-45 -mt-1 border-r border-b border-amber-500/50"></div>
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
      <div class="h-full flex flex-col bg-stone-950/95 backdrop-blur-md border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
        <!-- Header Image with Badge -->
        <div class="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-900 border-b border-amber-500/20">
          <img src="${loc.image}" alt="${loc.title}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
          
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 text-xs font-roman uppercase tracking-wider bg-amber-500/90 text-stone-950 font-bold rounded-full shadow-lg">
              ${loc.badge}
            </span>
          </div>

          <div class="absolute bottom-3 left-4 right-4">
            <p class="text-amber-400 text-xs font-roman tracking-wider uppercase">${loc.latinTitle}</p>
            <h3 class="text-xl sm:text-2xl font-roman-decor font-bold text-amber-100 leading-tight">${loc.title}</h3>
          </div>
        </div>

        <!-- Content Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-stone-300 text-sm">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-500 font-roman">Historical Significance</span>
            <p class="mt-1 leading-relaxed text-stone-300">${loc.summary}</p>
          </div>

          <!-- Direct Quote from Book -->
          <div class="p-3.5 rounded-xl bg-amber-950/20 border-l-2 border-amber-500 text-stone-300 italic font-serif-book text-xs sm:text-sm leading-relaxed shadow-inner">
            “${loc.bookQuote}”
            <div class="mt-2 text-right not-italic text-xs font-roman text-amber-400">
              — ${loc.chapterRef} (Page ${loc.page})
            </div>
          </div>

          <!-- Characters at Location -->
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-500 font-roman">Key Figures at Location</span>
            <div class="mt-2 flex flex-wrap gap-1.5">
              ${loc.charactersPresent.map(char => `
                <span class="px-2 py-0.5 rounded-md bg-stone-900 border border-amber-500/20 text-stone-300 text-xs">
                  ${char}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Jump to Book Reader -->
          <div class="pt-2">
            <a href="#reader" data-chapter="${loc.page}" class="jump-to-scene-btn flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-roman font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
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
