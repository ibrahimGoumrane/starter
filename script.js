'use strict';


/////////////////////////////////////////////////
//Application architechture :

//using the Geolocation APi :(like the Intl api or the intersection observer api)
//takes two callback functions success function and error function
class App {
    #map; //this map class attribut is private it cannot be accessed outside the class
    #event_map;//this is just a convention and  every object is able to enherit it.
    #workouts = [];
    #zoomLevel = 13;
    //loading the page will trigger the constructor (initialisation of the app)
    constructor() {
        //get user position
        this._getPosition();
        this.markerTimeOut = false;
        this.timermarker = 5000;
        //Get data from local storage
        this._getLocalStorage();

        //attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), (position) => {//bind method return a new function with a new this keyword
                console.log(position);
                console.log('no we didnt get the position');
            });
        };
    }
    _loadMap(position) {
        {
            // in the position cords we got 
            //L is refering to leaflet
            //need an html element with id map
            const { latitude } = position.coords;
            const { longitude } = position.coords;

            const coords = [latitude, longitude];

            this.#map = L.map('map', {
                closePopupOnClick: false
            }).setView(coords, this.#zoomLevel);
            //L is leaflet module on that module we create a map and we put the coordinate that the map will be centred arrround
            //13 is the map zoom

            L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

            this.#workouts.forEach(work => {
                this._renderWorkoutmarker(work);//not working cause the map not yet loaded
            })

            //like python adding __ before the name of mathodes means that is not appropriate to use it. 
            //but u can use it using prototypal inheritance


            //handling clicks on map
            this.#map.on('click', this._showForm.bind(this))
        }
    }
    _showForm(mapevent) {
        this.#event_map = mapevent
        form.classList.remove('hidden');
        inputDistance.focus();
    }
    _hideForm() {
        //Empty inputs
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');//to ensure that the form will still be hidden if no clicks are triggerd
        setTimeout(() => form.style.display = 'grid', 1000);
    }
    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e) {
        e.preventDefault();
        const validInputs = (...inputs) =>
            inputs.every(inp =>
                Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        if (!this.markerTimeOut) {
            //get data from the form 
            const type = inputType.value;
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;
            const { lat, lng } = this.#event_map.latlng;
            const coords = [lat, lng];
            let workout;
            //if running create running object
            if (type === 'running') {
                const cadence = +inputCadence.value;
                //check if data is valid
                if (!validInputs(distance, duration, cadence)
                    || !allPositive(distance, duration, cadence))
                    return alert('Inputs have to be positive numbers')
                workout = new Running(coords, distance, duration, cadence);
            }
            //if cycling create cycling object
            if (type === 'cycling') {
                const elevation = +inputElevation.value;
                if (!validInputs(distance, duration, elevation)
                    || !allPositive(distance, duration))
                    return alert('Inputs have to be positive numbers')
                workout = new Cycling([lat, lng], distance, duration, elevation);
            }
            workout.info = `${workout.type === "running" ? '🏃 ' : '🚴‍♀️'} ${workout.decription}`
            this.#workouts.push(workout);
            //render workout on map as a marker

            this._renderWorkoutmarker(workout);
            //hide form +clear input fields
            this._hideForm()
            //render workout on list 
            this.__renderWorkout(workout);

            //Set local storage to all workouts
            this._setLocalStorge();


            this.markerTimeOut = true
            setTimeout(() => {
                this.markerTimeOut = false;
            }, this.timermarker)
        }
        else {
            alert('marker not available wait a bit');
        }
    }
    _renderWorkoutmarker(workout) {
        L.marker(workout.coords, {
            // draggable: true
        }).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                autoPan: true,
                className: `${workout.type}-popup`,//workout.constructor.name.toLowerCase()
            }))
            .setPopupContent(workout.info)
            //methods that return this the current object are used in ordre to make methods chainable
            .openPopup();
    }
    __renderWorkout(workout) {
        const html = document.createElement('li');
        html.classList.add(`workout`);
        html.classList.add(`workout--${workout.type}`);
        html.dataset.id = `${workout.id}`;
        html.innerHTML = `
                <h2 class="workout__title">${workout.decription}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === "running" ? '🏃 ' : '🚴‍♀️'}
                    </span><span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div >
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
`;
        if (workout.type === 'running') {
            html.innerHTML += `       
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(2)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
                </li>`;
        }
        else {
            html.innerHTML += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(2)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
                </li>
            `;
        }
        form.insertAdjacentElement('afterend', html);
    }
    _moveToPopup(event) {
        const workoutEl = event.target.closest('.workout');
        if (!workoutEl) return;
        const workout = this.#workouts.find((work) => work.id === +workoutEl.dataset.id);
        this.#map.flyTo(workout.coords, this.#zoomLevel, {
            animate: true,
            duration: 1, // specify the duration in seconds
            easeLinearity: 1
        });
        workout._click();
    }
    _setLocalStorge() {
        //local stroage is an api that is used only for small amounts of data because it is a blocking api
        //blocking api not good for big amount of data
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));//key value storage
    }
    _getLocalStorage() {
        // coming from local storage :regular objects that why i did the convertion.
        let data = localStorage.getItem('workouts');
        data = JSON.parse(data);

        if (!data) return;
        this.#workouts = data.map(element => {
            let work
            if (element.type === 'running') {
                work = new Running(element.coords, element.distance, element.duration, element.cadence, element.info);
            }
            else {
                work = new Cycling(element.coords, element.distance, element.duration, element.cadence, element.info);
            }
            return work;
        });
        this.#workouts.forEach(work => {
            this.__renderWorkout(work);
            // this._renderWorkoutmarker(work);//not working cause the map not yet loaded
        })
    }
    _delLocalStorage() {
        localStorage.removeItem('workouts');
        location.reload()
    }
    //all methods are private 
}

//this app object is created after the page is loaded
const app = new App();//initialisation of new instance of the App class


