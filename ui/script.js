'use strict';

const form = document.querySelector('.form');
const containerAnimals = document.querySelector('.animals');
const animalType = document.querySelector('.form__input--type');
const animalName = document.querySelector('.form__input--name');
const animalGPS = document.querySelector('.form__input--gps_id');
const animalGender = document.querySelector('.form__input--gender');

class Animal {
  date = new Date();
  id = Date.now() + ''.slice(-10); // take the date convert to string and take the last 10 to create an id
  clicks = 0;

  constructor(coords, name, gender, gpsID) {
    this.coords = coords;
    this.name = name;
    this.gender = gender;
    this.gpsID = gpsID;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      '1'
    )} tracked since ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Cow extends Animal {
  type = 'cow';
  constructor(coords, name, gender, gpsID) {
    super(coords, name, gender, gpsID);
    this._setDescription();
  }
}

class Sheep extends Animal {
  type = 'sheep';
  constructor(coords, name, gender, gpsID) {
    super(coords, name, gender, gpsID);
    this._setDescription();
  }
}


// Main
class App {
  //global
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #animals = [];
  constructor() {
    //Get data from local storage
    this._getLocalStorage();
    // Get users position
    this._getPosition();

    // Attach event handlers
    form.addEventListener('submit', this._newAnimal.bind(this)); //on method is coming from the leaflet library

    // Hiding any fields for different animals
    //animalType.addEventListener('change', this._hideField);
    containerAnimals.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("Couldn't get your position");
      }
    ); //first callback func is for the succes situation, second callback function is the error callback
  }


  // Load map and handling clicks on map to add new animal
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //creating google maps link, copy and replace longitude and latitude
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); //second zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png   for a different map theme
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
    this.#animals.forEach(work => {
      this._renderAnimalMarker(work);
    });
  }

  // Show form on the panel to add Animal
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    animalName.focus(); //for the cursor to immediately focus on input
  }


  // Hide form after adding animal
  _hideForm() {
    //Empty inputs
    animalName.value =
    animalGPS.value =
    animalGender.value =
        '';
    form.style.display = 'none'; //this line
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid'; // and this line to block the transition
    }, 1000);
  }

  _hideField() {
    animalGender.closest('.form__row').classList.toggle('form__row--hidden');
  }


  // Create new Animal instance
  _newAnimal(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();

    //Get data from the form
    const type = animalType.value;
    const name = animalName.value;
    const gpsID = +animalGPS.value;
    const gender = animalGender.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let animal;

    //Check if data is valid
    if (
      !validInputs(gpsID) ||
      !allPositive(gpsID)
    )
    
    return alert('Inputs have to be positive numbers!');

    //If animal cow, create cow object
    if (type === 'cow') {
      animal = new Cow([lat, lng], name, gender, gpsID);
    }
    //If animal is sheep, create Sheep object
    if (type === 'sheep') {
      animal = new Sheep([lat, lng], name, gender, gpsID);
    }
    //Add new object to animal array
    this.#animals.push(animal);

    //Render animal on map as marker
    this._renderAnimalMarker(animal);
    //Render animal on list
    this._renderAnimal(animal);

    // Hide form + clear input fields

    this._hideForm();

    // Set local storage to all animals
    this._setLocalStorage();
  }
  _renderAnimalMarker(animal) {
    L.marker(animal.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${animal.type}-popup`,
        })
      )
      .setPopupContent(
        `${animal.type === 'cow' ? '🐄' : ' 🐑'} ${animal.description}`
      )
      .openPopup();
  }


  // Display animal list on sidebar
  _renderAnimal(animal) {
    let html = `
    <li class="animal  animal--${animal.name}" data-id="${animal.gpsID}">
    <h2 class="animal__title">${animal.description}</h2>
    <div class="animal__details">
      <span class="animal__icon"> ${
        animal.type === 'cow' ? '🐄 ' : '🐑 '
      } </span>
      <span class="animal__value">${animal.name}</span>
    </div>
    <div class="animal__details">
      <span class="animal__icon">♀♂️ </span>
      <span class="animal__value">${animal.gender}</span>
    </div>
    <div class="animal__details">
      <span class="animal__icon">📍 </span>
      <span class="animal__value">${animal.gpsID}</span>
    </div>`;
    /* Adding type based filtering if necessary */
    /*
    if (animal.type === 'cow')
      html += `
          <div class="animal__details">
          <span class="animal__icon">⚡️</span>
          <span class="animal__value">${animal.pace.toFixed(1)}</span>
          <span class="animal__unit">min/km</span>
        </div>
      </li>
    `;
    if (animal.type === 'sheep')
      html += `
        <div class="animal__details">
          <span class="animal__icon">⚡️</span>
          <span class="animal__value">${animal.speed.toFixed(1)}</span>
          <span class="animal__unit">km/h</span>
        </div>
        <div class="animal__details">
          <span class="animal__icon">⛰</span>
          <span class="animal__value">${animal.elevationGain}</span>
          <span class="animal__unit">m</span>
        </div>
      </li>
    `;*/

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const animalEl = e.target.closest('.animal');

    if (!animalEl) return; //guard class

    const animal = this.#animals.find(
      work => work.id === animalEl.dataset.id
    );

    this.#map.setView(animal.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //using the public interface
    /*     animal.click(); */
  }

  /* Local storage to cache animal data */

  _setLocalStorage() {
    localStorage.setItem('animals', JSON.stringify(this.#animals)); //object to string
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('animals')); //string to object

    if (!data) return;

    this.#animals = data;
    this.#animals.forEach(work => {
      this._renderAnimal(work);
    });
  }

  reset() {
    localStorage.removeItem('animals');
    location.reload();
  }
}

const app = new App();
