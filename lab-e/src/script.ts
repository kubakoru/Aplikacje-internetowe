interface AppState {
  currentStyle: string;
  currentFile: string;
  availableStyles: { [key: string]: string };
}

const state: AppState = {
  currentStyle: "style-1",
  currentFile: "style-1.css",
  availableStyles: {
    "style-1": "style-1.css",
    "style-2": "style-2.css",
    "style-3": "style-3.css"
  }
};

function loadStyle(styleFile: string): void {
  const oldLink = document.querySelector('link[rel="stylesheet"]');
  if (oldLink) {
    oldLink.remove();
  }

  const newLink = document.createElement('link');
  newLink.rel = 'stylesheet';
  newLink.href = styleFile;
  document.head.appendChild(newLink);
}

function changeStyle(styleName: string): void {
  const styleFile = state.availableStyles[styleName];
  if (styleFile) {
    state.currentStyle = styleName;
    state.currentFile = styleFile;
    loadStyle(styleFile);
  }
}

function createStyleLinks(): void {
  const linksContainer = document.createElement('nav');
  linksContainer.id = 'style-switcher';
  
  for (const styleName in state.availableStyles) {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = styleName;
    link.onclick = (e) => {
      e.preventDefault();
      changeStyle(styleName);
    };
    linksContainer.appendChild(link);
    linksContainer.appendChild(document.createTextNode(' | '));
  }

  document.body.insertBefore(linksContainer, document.body.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {
  loadStyle(state.currentFile);
  createStyleLinks();
});