const galleryEl = document.getElementById('gallery');
const locationsEl = document.getElementById('locations');
const activeLabelEl = document.getElementById('activeLabel');
const countEl = document.getElementById('photoCount');
const lightboxEl = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const menuToggle = document.getElementById('menuToggle');
const sidebarEl = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

const state = {
  photos: [],
  activeLocation: 'All',
  activeList: [],
  activeIndex: 0
};

const NATIONAL_PARKS = [
  'Arches',
  'Bryce Canyon',
  'Capitol Reef',
  'Crater Lake',
  'Death Valley',
  'Grand Canyon',
  'Grand Teton',
  'Joshua Tree',
  'Sequoia National Park',
  'Yellowstone',
  'Yosemite'
];

const normalizeLocation = (location) => location.trim();

const buildLocations = (photos) => {
  const counts = new Map();
  photos.forEach((photo) => {
    const key = normalizeLocation(photo.location || 'Other');
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const entries = Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  const parks = NATIONAL_PARKS
    .filter((name) => counts.has(name))
    .map((name) => ({ name, count: counts.get(name) }));

  const parkSet = new Set(NATIONAL_PARKS);
  const rest = entries.filter((item) => !parkSet.has(item.name));

  const locations = [{ name: 'All', count: photos.length }];
  if (parks.length) {
    locations.push({ type: 'heading', label: 'National Parks' });
    locations.push(...parks);
  }
  if (rest.length) {
    locations.push({ type: 'divider' });
    locations.push(...rest);
  }
  return locations;
};

const renderLocations = (locations) => {
  locationsEl.innerHTML = '';
  locations.forEach((location) => {
    if (location.type === 'heading') {
      const heading = document.createElement('div');
      heading.className = 'location-heading';
      heading.textContent = location.label;
      locationsEl.appendChild(heading);
      return;
    }
    if (location.type === 'divider') {
      const divider = document.createElement('div');
      divider.className = 'location-divider';
      locationsEl.appendChild(divider);
      return;
    }
    const button = document.createElement('button');
    button.className = 'location-btn';
    if (location.name === state.activeLocation) {
      button.classList.add('active');
    }
    button.type = 'button';
    button.textContent = location.name;

    const count = document.createElement('span');
    count.textContent = location.count;
    button.appendChild(count);

    button.addEventListener('click', () => {
      state.activeLocation = location.name;
      render();
      closeSidebar();
    });

    locationsEl.appendChild(button);
  });
};

const renderGallery = (photos) => {
  galleryEl.innerHTML = '';
  photos.forEach((photo) => {
    const card = document.createElement('article');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = encodeURI(photo.file);
    img.alt = `${photo.title} - ${photo.location}`;
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(photo));
    card.appendChild(img);
    
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = photo.location;
    card.appendChild(caption);
    galleryEl.appendChild(card);
  });
};

const render = () => {
  const filtered = state.activeLocation === 'All'
    ? state.photos
    : state.photos.filter((photo) => normalizeLocation(photo.location) === state.activeLocation);

  state.activeList = filtered;

  activeLabelEl.textContent = state.activeLocation === 'All'
    ? 'All Photos'
    : state.activeLocation;
  countEl.textContent = `${filtered.length} photo${filtered.length === 1 ? '' : 's'}`;

  const locations = buildLocations(state.photos);
  renderLocations(locations);
  renderGallery(filtered);
};

const init = async () => {
  try {
    const response = await fetch('photos.json');
    if (!response.ok) {
      throw new Error('Failed to load photos.json');
    }
    const photos = await response.json();
    state.photos = photos;
    render();
  } catch (error) {
    galleryEl.innerHTML = '<p>Unable to load photos.</p>';
    console.error(error);
  }
};

const openLightbox = (photo) => {
  const index = state.activeList.findIndex((item) => item.file === photo.file);
  state.activeIndex = index >= 0 ? index : 0;
  updateLightbox();
  lightboxEl.classList.add('open');
  lightboxEl.setAttribute('aria-hidden', 'false');
};

const updateLightbox = () => {
  const photo = state.activeList[state.activeIndex];
  if (!photo) {
    return;
  }
  lightboxImg.src = encodeURI(photo.file);
  lightboxImg.alt = `${photo.title} - ${photo.location}`;
};

const closeLightbox = () => {
  lightboxEl.classList.remove('open');
  lightboxEl.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
};

const showPrev = () => {
  if (!state.activeList.length) return;
  state.activeIndex = (state.activeIndex - 1 + state.activeList.length) % state.activeList.length;
  updateLightbox();
};

const showNext = () => {
  if (!state.activeList.length) return;
  state.activeIndex = (state.activeIndex + 1) % state.activeList.length;
  updateLightbox();
};

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (event) => {
  event.stopPropagation();
  showPrev();
});
lightboxNext.addEventListener('click', (event) => {
  event.stopPropagation();
  showNext();
});
lightboxEl.addEventListener('click', (event) => {
  if (event.target === lightboxEl) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (!lightboxEl.classList.contains('open')) {
    return;
  }
  if (event.key === 'Escape') {
    closeLightbox();
  }
  if (event.key === 'ArrowLeft') {
    showPrev();
  }
  if (event.key === 'ArrowRight') {
    showNext();
  }
});

const openSidebar = () => {
  sidebarEl.classList.add('open');
  sidebarBackdrop.classList.add('show');
  menuToggle.setAttribute('aria-expanded', 'true');
  sidebarBackdrop.setAttribute('aria-hidden', 'false');
};

const closeSidebar = () => {
  sidebarEl.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
  menuToggle.setAttribute('aria-expanded', 'false');
  sidebarBackdrop.setAttribute('aria-hidden', 'true');
};

menuToggle.addEventListener('click', () => {
  if (sidebarEl.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarBackdrop.addEventListener('click', closeSidebar);

init();
