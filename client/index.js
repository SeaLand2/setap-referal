const pages = [
  {
    screen: 'home',
    title: 'Home',
  }
];

const ui = {};
const templates = {};


/// UI functions ///

// store references to the DOM elements for the main areas of the page
function getHandles() {
  ui.mainnav = document.querySelector('header > nav');
  ui.main = document.querySelector('main');
  ui.footer = document.querySelector('footer');
  // Cceate a reference to each screen element
  ui.screens = {};
  // create an array for each screen element
  ui.getScreens = () => Object.values(ui.screens);
  // create an array for each button element
  ui.getButtons = () => Object.values(ui.buttons);
  // create objects for each template element
  templates.screen = document.querySelector('#temp-screen');
}


// create each screen using the temp-screen template
function buildScreens() {
  const template = templates.screen;
  for (const page of pages) {
    // first elemment is always the section
    const section = template.content.cloneNode(true).firstElementChild;
    const title = section.querySelector('.title');
    title.textContent = page.title;

    section.dataset.id = `section-${page.screen}`;
    section.dataset.name = page.screen;

    ui.main.append(section);
    // store a reference to the screen element to later use
    ui.screens[page.screen] = section;
  }
}


// build the navbar by creating buttons for each page
function buildNav() {
  ui.buttons = {};
  for (const page of pages) {
    if (page.screen === 'error') { continue; }
    const button = document.createElement('button');
    button.textContent = page.title;
    button.dataset.screen = page.screen;
    button.addEventListener('click', show);
    button.addEventListener('click', storeState);
    ui.mainnav.append(button);
    ui.buttons[page.screen] = button;
  }
}


// fetch the HTML for a specific screen
async function fetchScreenContent(screen) {
  const url = `/screens/${screen}.inc`;
  const response = await fetch(url);
  if (response.ok) {
    return await response.text();
  } else {
    return `A ${response.status} error occurred while retreiving section data for <code>${url}</code>`;
  }
}


// get the content for each screen
async function getContent() {
  for (const page of pages) {
    const content = await fetchScreenContent(page.screen);
    const article = document.createElement('article');
    article.innerHTML = content;
    ui.screens[page.screen].append(article);
  }
}


// hide all screens
function hideAllScreens() {
  for (const screen of ui.getScreens()) {
    hideElement(screen);
  }
}


// enable nav buttons
function enableAllButtons() {
  for (const button of ui.getButtons()) {
    button.removeAttribute('disabled');
  }
}


/*
    show a screen when a button is clicked
    if no event is passed, show the home screen
*/
function show(event) {
  ui.previous = ui.current;
  const screen = event?.target?.dataset?.screen ?? 'home';
  showScreen(screen);
}


// show a specific screen
function showScreen(screen) {
  hideAllScreens();
  enableAllButtons();
  // if the screen is not found, show the error screen
  if (!ui.screens[screen]) {
    screen = 'error';
  }
  showElement(ui.screens[screen]);
  ui.current = screen;
  document.title = `PJC | ${ui.screens[screen].querySelector('.title').textContent}`;
  if (screen !== 'error') {
    ui.buttons[screen].disabled = 'disabled';
  }
}


// store the current screen in the history
function storeState() {
  history.pushState(ui.current, ui.current, `/app/${ui.current}`);
}


// read the URL path from the address bar
function readPath() {
  const path = window.location.pathname.slice(5);
  if (path) {
    return path;
  }
  return 'home';
}


/// Screen functions ///

//


/// API functions ///

async function getThing() {
  const response = await fetch('/api/thing');
  if (response.ok) {
    return await response.json();
  } else {
    return false;
  }
}


/// Utulity functions ///
function showElement(element) {
  element.classList.remove('hidden');
}


function hideElement(element) {
  element.classList.add('hidden');
}


function loadInitialScreen() {
  ui.current = readPath();
  showScreen(ui.current);
}


async function main() {
  getHandles();
  buildScreens();
  buildNav();
  await getContent();
  buildHomeRaceSelector();
  buildCheckpointRunner();
  buildMarshalCodeEntry();
  buildRunTimer();
  try { buildRunnerList(); } catch (error) { console.log(error); }
  window.addEventListener('popstate', loadInitialScreen);
  loadInitialScreen();
}

main();