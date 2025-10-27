let map;
let userLatLng;
let puzzlePieces = [];
let correctCount = 0;

function initMap() {
  map = L.map('map').setView([52.0, 19.0], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    crossOrigin: true
  }).addTo(map);
}

document.getElementById('locateBtn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(pos => {
    userLatLng = [pos.coords.latitude, pos.coords.longitude];
    map.setView(userLatLng, 13);
    L.marker(userLatLng).addTo(map);
    alert(`Twoja lokalizacja: ${userLatLng}`);
  });
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  console.log('Klikniêto "Pobierz mapê"');
  document.getElementById('pieces').innerHTML = '';
  document.getElementById('puzzle-board').innerHTML = '';
  correctCount = 0;

  const zoom = map.getZoom();
  const tileSize = 256;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: ['a', 'b', 'c'],
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const center = map.getCenter();
  const point = map.project(center, zoom);
  const startX = Math.floor((point.x - 256) / tileSize);
  const startY = Math.floor((point.y - 256) / tileSize);

  let loaded = 0;
  const total = 16;

  for (let dx = 0; dx < 4; dx++) {
    for (let dy = 0; dy < 4; dy++) {
      const x = startX + dx;
      const y = startY + dy;
      const url = tileLayer.getTileUrl({ x, y, z: zoom });

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, dx * tileSize, dy * tileSize, tileSize, tileSize);
        loaded++;
        if (loaded === total) {
          createPuzzle(canvas);
        }
      };
      img.onerror = () => {
        console.error(`Nie uda³o siê za³adowaæ kafelka: ${url}`);
      };
      img.src = url;
    }
  }
});

function createPuzzle(canvas) {
  const ctx = canvas.getContext('2d');
  puzzlePieces = [];
  const pieceSize = 128;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = pieceSize;
      pieceCanvas.height = pieceSize;
      const pieceCtx = pieceCanvas.getContext('2d');
      pieceCtx.drawImage(canvas, x * pieceSize, y * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);
      const img = new Image();
      img.src = pieceCanvas.toDataURL();
      img.classList.add('piece');
      img.draggable = true;
      img.dataset.correct = `${x}-${y}`;
      img.addEventListener('dragstart', dragStart);
      document.getElementById('pieces').appendChild(img);
      puzzlePieces.push(img);
    }
  }

  shuffleArray(puzzlePieces);

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const slot = document.createElement('div');
      slot.classList.add('slot');
      slot.dataset.position = `${x}-${y}`;
      slot.addEventListener('dragover', e => e.preventDefault());
      slot.addEventListener('drop', dropPiece);
      document.getElementById('puzzle-board').appendChild(slot);
    }
  }
}

function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.correct);
  e.dataTransfer.setData('imgSrc', e.target.src);
}

function dropPiece(e) {
  const correct = e.dataTransfer.getData('text/plain');
  const src = e.dataTransfer.getData('imgSrc');
  const slotPos = e.target.dataset.position;

  if (correct === slotPos) {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('piece');
    e.target.appendChild(img);
    correctCount++;
    console.log(`Poprawnie ustawiono: ${correctCount}`);
    if (correctCount === 16) {
      showNotification();
    }
  }
}

function showNotification() {
  if (Notification.permission === 'granted') {
    new Notification('Gratulacje! Puzzle u³o¿one poprawnie!');
  } else {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('Gratulacje! Puzzle u³o¿one poprawnie!');
      }
    });
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

initMap();
