const BASE_API_URL = 'https://api.github.com/';
const SECURITY_HEADERS = {
  headers: {
    authorization: "token %your_token%"
  }
};

const rootElement = document.getElementById('root');
const loadingElement = document.getElementById('loading-overlay');

function callApi(endpoint, method = 'GET') {
  const url = BASE_API_URL + endpoint;
  //const options = { method, ...SECURITY_HEADERS };
  const options = { method};

  return fetch(url, options)
    .then(response =>
      response.ok
        ? response.json()
        : Promise.reject(Error('Failed to load'))
    )
    //.then(file => JSON.parse(atob(file.content)))
    .catch(error => { throw error });
}

class FighterService {
 #endpoint = 'repos/oleksandr-danylchenko/street-fighter/contents/resources/api/fighters.json'

 async getFighters() {
   try {
     const apiResult = await callApi(this.#endpoint, 'GET');
     return JSON.parse(atob(apiResult.content));
   } catch (error) {
     throw error;
   }
 }
}


const fighterService = new FighterService();

class View {
  element;

  createElement({ tagName, className = '', attributes = {} }) {
    const element = document.createElement(tagName);
    element.classList.add(className);
    
    Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));


    return element;
  }
  get element() {
    return this.element;
  }

  set element(value) {
    this.element = value;
  }
}


class FighterView extends View {
  constructor(fighter, handleClick) {
    super();
    this.createFighter(fighter, handleClick);
  }

  createFighter(fighter, handleClick) {
    const { name, source } = fighter;
    const nameElement = this.createName(name);
    const imageElement = this.createImage(source);

    this.element = this.createElement({ tagName: 'div', className: 'fighter' });
    this.element.append(imageElement, nameElement);
    this.element.addEventListener('click', event => handleClick(event, fighter), false);
  }

  createName(name) {
    const nameElement = this.createElement({ tagName: 'span', className: 'name' });
    nameElement.innerText = name;
    return nameElement;
  }

  createImage(source) {
    const attributes = { src: source };
    return this.createElement({
      tagName: 'img',
      className: 'fighter-image',
      attributes
    });
  }
}

class FightersView extends View {
fightersDetailsMap = new Map();

 constructor(fighters) {
    super();

    this.handleClick = this.handleFighterClick.bind(this);
    this.createFighters(fighters);
  }

  createFighters(fighters) {
    const fighterElements = fighters.map(fighter => {

      // 1. Class function with context
      const fighterView = new FighterView(fighter, this.handleClick);

      // 2. Inline context binding
      //const fighterView = new FighterView(fighter, this.handleFighterClick.bind(this));

      // 3. Arrow function
      //const fighterView = new FighterView(fighter, (event, fighters) => this.handleFighterClick(event, fighters));

      return fighterView.element;
    });

    // ...
    this.element = this.createElement({ tagName: 'div', className: 'fighters' });

    this.element.append(...fighterElements);
  }

  
  handleFighterClick(event, fighter) {
    this.fightersDetailsMap.set(fighter._id, fighter);
    console.log('clicked')
    // get from map or load info and add to fightersMap
    // show modal with fighter info
    // allow to edit health and power in this modal
  }
}

class App {
  static rootElement = document.getElementById('root');
  static loadingElement = document.getElementById('loading-overlay');

  static async startApp() {
    try {
      App.loadingElement.style.visibility = 'visible';

      const fighters = await fighterService.getFighters();
      const fightersView = new FightersView(fighters);

      App.rootElement.appendChild(fightersView.element);
    } catch (error) {
      console.warn(error);
      App.rootElement.innerText = 'Failed to load data';
    } finally {
      App.loadingElement.style.visibility = 'hidden';
    }
  }
}

App.startApp();