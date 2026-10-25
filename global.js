console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// ===== Step 2: Automatic current page link =====
// (Replaced by Step 3, which adds the class while building the nav.)
// let navLinks = $$('nav a');
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );
// currentLink?.classList.add('current');

// ===== Step 3: Automatic navigation menu =====
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/krishang2006', title: 'GitHub' },
];

// Local server vs. GitHub Pages (repo is hosted under /portfolio/)
const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/portfolio/'; // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Prefix relative URLs with the base path
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  // Open external links (e.g. GitHub) in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}

// ===== Step 4: Dark mode switcher =====
document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

// Restore the saved preference on page load
if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

// ===== Step 5: Better contact form =====
let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let url = form.action + '?';
  let params = [];

  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  url += params.join('&');
  location.href = url;
});

// ===== Lab 4 Step 1.2: Fetch JSON data =====
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// ===== Lab 4 Step 1.4: Render projects into a container =====
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Guard against a missing container
  if (!(containerElement instanceof HTMLElement)) {
    console.error('renderProjects: containerElement is not a valid DOM element');
    return;
  }

  // Validate the heading level (fall back to h2 for anything else)
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel)) {
    console.warn(`renderProjects: invalid headingLevel "${headingLevel}", using h2`);
    headingLevel = 'h2';
  }

  // Clear existing content so re-rendering doesn't duplicate articles
  containerElement.innerHTML = '';

  // Accept a single project object as well as an array
  const list = Array.isArray(projects) ? projects : projects ? [projects] : [];

  // Placeholder when there is nothing to show
  if (list.length === 0) {
    containerElement.innerHTML = '<p class="empty">No projects to display yet.</p>';
    return;
  }

  for (const project of list) {
    const article = document.createElement('article');

    const title = project.title ?? 'Untitled project';
    const image = project.image ?? 'https://dsc106.com/labs/lab02/images/empty.svg';
    const description = project.description ?? '';
    const year = project.year ? `<p class="year">${project.year}</p>` : '';

    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      <img src="${image}" alt="${title}">
      <div>
        <p>${description}</p>
        ${year}
      </div>
    `;

    containerElement.appendChild(article);
  }
}

// ===== Lab 4 Step 3.2: Fetch GitHub profile data =====
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
