var numDaysForecast = 5;
var apiKey = '259f549c2c4387f7ce66babb16248971';
var localStorageKey = 'weather-dashboard-history';
var cityInputEl = document.querySelector('#city-name');
var cityFormEl = document.querySelector('#search-form');
var historyEl = $('.weather-history');
var weatherCol = $('.weather-col');
var cityHistory;

// Handles the search form and will attempt to get weather data for a city
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

// Using the city name it gets the geocoding information to get the latitude and longitude to pass for the OneCall API
var getGeocoding = function (cityName) {
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&appid=' + apiKey;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
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

var getOneCallData = function (lat, lon, city) {
    // Gets the one call data using latitude and longitude, excluding the hourly and minutely weather, in imperial units
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat +
        '&lon=' + lon + '&exclude=hourly,minutely&units=imperial&appid=' + apiKey;
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayWeather(data,city);
                saveCityName(city);
            });
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
var loadHistory = function() {
    cityHistory = localStorage.getItem(localStorageKey);
    if (!cityHistory) {
        cityHistory = [];
    } else {
        cityHistory = JSON.parse(cityHistory);
        createHistory();
    }
};

var displayWeather = function(data,city){
    weatherCol.empty();
    var divEl = $('<div>').addClass('col-12 primary-card p-2');
    loadWeatherInformation(divEl,data.current,city);
    var rowEl = $('<div>').addClass('row')
        .append(divEl);
    weatherCol.append(rowEl);
    divEl = $('<div>').addClass('col-12')
        .append($('<h4>').text('5 Day Forecast:'));
    rowEl = $('<div>').addClass('row')
        .append(divEl);
    weatherCol.append(rowEl);
    var rowEl = $('<div>').addClass('row justify-content-between');
    for(var i = 1; i < 6; i++){
        var divEl = $('<div>').addClass('col-xl-auto col-12 weather-card border p-2');
        loadWeatherInformation(divEl,data.daily[i]);
        rowEl.append(divEl);        
    }
    weatherCol.append(rowEl);
}

// function to avoid repeating the same actions and simplify element creation
var createWeatherInfoDiv = function(displayName,classes,val){
    var divEl = $('<div>')
    if (displayName){
        divEl.text(displayName + ": ");
    }
    var spanEl = $('<span>').addClass(classes).text(val);
    divEl.append(spanEl);
    return divEl;
};

// Loads the weather information into the element passed in using the data array passed in
var loadWeatherInformation = function(primaryEl, data, city){
    var divEl, spanEl;
    var date = new Date(data.dt * 1000);
    var dateString = date.getMonth()+1 +'/'+ date.getDate() +'/'+ date.getFullYear();
    var imgEl = $('<img>').attr('src','https://openweathermap.org/img/wn/'+ data.weather[0].icon +'.png');
    primaryEl.append(createWeatherInfoDiv('Wind','wind',data.wind_speed + ' MPH'));
    primaryEl.append(createWeatherInfoDiv('Humidity','humidity',data.humidity + '%'));
    
    // Checks if element is the primary card meant for the top display
    // and appends or prepends elements accordingly as the data is handled
    // or displayed differently
    if(primaryEl.hasClass('primary-card')){
        primaryEl.prepend(createWeatherInfoDiv('Temp','temp',data.temp));
        divEl = createWeatherInfoDiv('','date fw-bold fs-2',city + " (" + dateString + ")");
        divEl.append(imgEl);
        primaryEl.prepend(divEl);
        primaryEl.append(createWeatherInfoDiv('UV Index','uvi rounded px-3 py-1 text-white '+getUVIClass(data.uvi),data.uvi));
    // Normal weather card for 5 day forecast
    } else {
        primaryEl.prepend(createWeatherInfoDiv('Temp','temp',data.temp.day));
        primaryEl.prepend(imgEl);
        primaryEl.prepend(createWeatherInfoDiv('','date fw-bold',dateString));
    }
}

// function to get the class to add to the uv index for background color
var getUVIClass = function(uvi){
    if (uvi > 7){
        return 'uvi-very-high';
    } else if (uvi > 5){
        return 'uvi-high';
    } else if (uvi > 2){
        return 'uvi-moderate';
    } else {
        return 'uvi-low';
    }
}

cityFormEl.addEventListener('submit', formSubmitHandler);
historyEl.on('click','button',function(event){
    getGeocoding(event.target.textContent);
});

loadHistory();