'use strict';


//prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    //new specialisation not part of ES6
    //If you want to compute a value based on another property,
    // you should do it in the constructor.
    date = new Date();
    clicks = 0;
    constructor(coords, distance, duraton) {
        //creating ids
        this.id = parseInt((this.date.getTime() + '').slice(-10));
        this.coords = coords;// [lat ,lng] 
        this.distance = distance;//in km
        this.duration = duraton;//in min
        this._setDescription();
    }
    _setDescription() {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        const locales = navigator.language;
        const ins = new Intl.DateTimeFormat(locales, options).format(this.date);
        const formattedDateWithoutYear = ins.replace(/,\s\d{4}$/, '');
        this.decription = `${this.constructor.name} on ${formattedDateWithoutYear} `
    }
    _click() {
        this.clicks++;
    }

}
class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence, info = '') {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this.info = info;
    }
    calcPace() {
        //min/km
        this.pace = this.duration / this.distance;
    }
}
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain, info) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this.info = info;
    }
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
    }
}
