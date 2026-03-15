const COLORS = [
  '#a8ff78', '#4f8fff', '#f9c74f', '#b97cff',
  '#ff6b6b', '#4ecdc4', '#ff9f43', '#a29bfe',
  '#fd79a8', '#55efc4', '#e17055', '#74b9ff',
];

let categories    = [];
let selectedIndex = null;
let colorPickerOpen = null;

async function loadData() {
  if (window.electronAPI?.getCategories) {
    categories = await window.electronAPI.getCategories();
  }
  renderCategories();
}

function renderCategories() {
  const list = document.getElementById('category-list');
  if (categories.length === 0) {
    list.innerHTML = '<div class="empty">No categories yet</div>';
    return;
  }

  list.innerHTML = categories.map((cat, i) => `
    <div class="category-row ${selectedIndex === i ? 'active' : ''}" onclick="selectCategory(${i})">
      <div class="cat-color" style="background:${cat.color}"
           onclick="event.stopPropagation(); toggleColorPicker(${i})"></div>
      <input class="cat-name-input" value="${cat.name}"
             onclick="event.stopPropagation()"
             onchange="renameCategory(${i}, this.value)"
             ${cat.name === 'Uncategorized' ? 'disabled' : ''}/>
      <span class="cat-count">${cat.apps.length} apps</span>
      ${cat.name !== 'Uncategorized' ? `<button class="cat-delete" onclick="event.stopPropagation(); deleteCategory(${i})">✕</button>` : ''}
    </div>
    ${colorPickerOpen === i ? `
      <div class="color-options">
        ${COLORS.map(c => `
          <div class="color-swatch ${c === cat.color ? 'selected' : ''}"
               style="background:${c}"
               onclick="setColor(${i}, '${c}')"></div>
        `).join('')}
      </div>` : ''}
  `).join('');
}

function renderApps() {
  const panel = document.getElementById('app-assignments');
  if (selectedIndex === null) {
    panel.innerHTML = '<div class="empty">Select a category on the left</div>';
    return;
  }

  const cat  = categories[selectedIndex];
  const apps = cat.apps;

  panel.innerHTML = `
    ${apps.length === 0
      ? '<div class="empty">No apps assigned yet</div>'
      : apps.map((app, i) => `
          <div class="app-item">
            <span class="app-item-name">${app}</span>
            <button class="app-remove" onclick="removeApp(${i})">✕</button>
          </div>`).join('')
    }
    <div class="add-app-row" style="margin-top:0.8rem">
      <input class="input-field" id="new-app-input"
             placeholder="app name (e.g. spotify)"
             onkeydown="if(event.key==='Enter') addApp()"/>
      <button class="btn btn-ghost btn-sm" onclick="addApp()">Add</button>
    </div>
  `;
}

function selectCategory(i) {
  selectedIndex   = i;
  colorPickerOpen = null;
  renderCategories();
  renderApps();
}

function toggleColorPicker(i) {
  colorPickerOpen = colorPickerOpen === i ? null : i;
  renderCategories();
}

function setColor(i, color) {
  categories[i].color = color;
  colorPickerOpen     = null;
  renderCategories();
}

function renameCategory(i, name) {
  categories[i].name = name.trim() || categories[i].name;
}

function deleteCategory(i) {
  if (categories[i].name === 'Uncategorized') return;
  categories.splice(i, 1);
  if (selectedIndex === i)      selectedIndex = null;
  else if (selectedIndex > i)   selectedIndex--;
  renderCategories();
  renderApps();
}

function addCategory() {
  categories.unshift({
    name:  'New Category',
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    apps:  [],
  });
  selectedIndex = 0;
  renderCategories();
  renderApps();
  setTimeout(() => {
    const input = document.querySelector('.category-row .cat-name-input');
    if (input) { input.focus(); input.select(); }
  }, 50);
}

function addApp() {
  if (selectedIndex === null) return;
  const input = document.getElementById('new-app-input');
  const name  = input.value.trim().toLowerCase();
  if (!name) return;
  if (!categories[selectedIndex].apps.includes(name)) {
    categories[selectedIndex].apps.push(name);
  }
  input.value = '';
  renderCategories();
  renderApps();
}

function removeApp(appIndex) {
  if (selectedIndex === null) return;
  categories[selectedIndex].apps.splice(appIndex, 1);
  renderCategories();
  renderApps();
}

async function saveAll() {
  if (window.electronAPI?.saveCategories) {
    const ok = await window.electronAPI.saveCategories(categories);
    showToast(ok ? '✓ Saved!' : '✗ Save failed');
  } else {
    showToast('✓ Saved! (demo)');
  }
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

window.addEventListener('DOMContentLoaded', loadData);