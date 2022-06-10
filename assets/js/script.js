var numDaysForecast = 5;
var apiKey = '259f549c2c4387f7ce66babb16248971';
var localStorageKey = 'weather-dashboard-history';
var cityInputEl = document.querySelector('#city-name');
var cityFormEl = document.querySelector('#search-form');
var historyEl = $('.weather-history');
var cityHistory;

var formSubmitHandler = function (event) {
    event.preventDefault();
    var cityName = cityInputEl.value.trim();

    if (cityName) {
        // formats city name and passes to geocoding function
        getGeocoding(formatCityName(cityName));
        cityInputEl.value = '';
    } else {
        alert("Please enter valid city name");
    }
}

var getOneCallData = function (lat, lon, city) {
    // Gets the one call data using latitude and longitude, excluding the hourly and minutely weather, in imperial units
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat +
        '&lon=' + lon + '&exclude=hourly,minutely&units=imperial&appid=' + apiKey;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                saveCityName(city);
            });
        }
    })
}

// Using the city name it gets the geocoding information to get the latitude and longitude to pass for the OneCall API
var getGeocoding = function (cityName) {
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&appid=' + apiKey;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
                // Will be an empty array if we entered an invalid location
                if (data.length > 0) {
                    getOneCallData(data[0].lat, data[0].lon, cityName);
                } else {
                    alert('Please enter a valid city name.');
                }
            })
        }
    })
}

// Formats the city name to display it best
var formatCityName = function (city) {
    // Makes string lowercase
    city = city.toLowerCase();
    // Splits string into an array wherever there is a break
    var cityArray = city.split(" ");
    // iterates through the array to capitalize the first letter of each part
    for (var i = 0; i < cityArray.length; i++) {
        cityArray[i] = cityArray[i][0].toUpperCase() + cityArray[i].substr(1);
    }
    // rejoins the array back to a single string
    city = cityArray.join(' ');
    return city;
}

// Saves city names to the history of searches without adding duplicates
var saveCityName = function (city) {
    // Prevents the same city from being added again
    if (cityHistory.indexOf(city) < 0) {
        cityHistory.push(city);
        createHistoryItem(city);
        // Keeps a history of only 10 searches and removes the oldest entry and removes the button
        if (cityHistory.length > 9) {
            cityHistory.shift();
            var historyButtons = $('.weather-history .btn');
            historyButtons[historyButtons.length - 1].remove();
        }
        // If the city has been searched already, we move it in the array to be the most recent search
        // and recreate the history with the buttons to display this change
    } else {
        cityHistory.splice(cityHistory.indexOf(city), 1);
        cityHistory.push(city);
        createHistory();
    }
    saveHistory();
}

// Creates buttons for the history of searches
var createHistory = function () {
    historyEl.empty();
    for (var i = 0; i < cityHistory.length; i++) {
        createHistoryItem(cityHistory[i]);
    }
}

// Adds a button for the searched cities
var createHistoryItem = function (city) {
    var btnEl = $('<button>').addClass('btn btn-outline-primary w-100 my-2');
    btnEl.text(city);
    historyEl.prepend(btnEl);
}

// Saves the history of searches to local storage
var saveHistory = function () {
    if (cityHistory.length > 0) {
        localStorage.setItem(localStorageKey, JSON.stringify(cityHistory));
    }
}

// Attempts to load the history of searches from local storage
function loadHistory() {
    cityHistory = localStorage.getItem(localStorageKey);
    if (!cityHistory) {
        cityHistory = [];
    } else {
        cityHistory = JSON.parse(cityHistory);
        createHistory();
    }
};

cityFormEl.addEventListener('submit', formSubmitHandler);

loadHistory();

$('.primary-card > div:first-child').addClass('fw-bold fs-2');
$('.weather-card > div:first-child').addClass('fw-bold');