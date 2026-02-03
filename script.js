const galleryEl = document.getElementById('gallery');
const locationsEl = document.getElementById('locations');
const activeLabelEl = document.getElementById('activeLabel');
const countEl = document.getElementById('photoCount');

const state = {
  photos: [],
  activeLocation: 'All'
};

const normalizeLocation = (location) => location.trim();

const buildLocations = (photos) => {
  const counts = new Map();
  photos.forEach((photo) => {
    const key = normalizeLocation(photo.location || 'Other');
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const locations = Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  locations.unshift({ name: 'All', count: photos.length });
  return locations;
};

const renderLocations = (locations) => {
  locationsEl.innerHTML = '';
  locations.forEach((location) => {
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
    card.appendChild(img);
    galleryEl.appendChild(card);
  });
};

const render = () => {
  const filtered = state.activeLocation === 'All'
    ? state.photos
    : state.photos.filter((photo) => normalizeLocation(photo.location) === state.activeLocation);

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

init();
