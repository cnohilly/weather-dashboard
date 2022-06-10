var numDaysForecast = 5;
var apiKey = '259f549c2c4387f7ce66babb16248971';
var localStorageKey = 'weather-dashboard-history';
var cityInputEl = document.querySelector('#city-name');
var cityFormEl = document.querySelector('#search-form');
var historyEl = $('.weather-history');
var cityHistory;

var formSubmitHandler = function(event){
    event.preventDefault();
    var cityName = cityInputEl.value.trim();

    if(cityName){
        getGeocoding(cityName);
        cityInputEl.value = '';
    } else {
        alert("Please enter valid city name");
    }
}

var getOneCallData = function(lat,lon,city){
    // Gets the one call data using latitude and longitude, excluding the hourly and minutely weather, in imperial units
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+ lat +
    '&lon=' + lon +'&exclude=hourly,minutely&units=imperial&appid='+apiKey;
    fetch(apiUrl).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                console.log(data);
                var temp = data.current.temp;
                var wind = data.current.wind_speed;
                var humidity = data.current.humidity;
                var uvi = data.current.uvi;
                console.log(temp,wind,humidity,uvi);
                saveCityName(city);
            });
        }
    })
}

// Using the city name it gets the geocoding information to get the latitude and longitude to pass for the OneCall API
var getGeocoding = function(cityName){
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q='+ cityName +'&appid=' + apiKey;
    fetch(apiUrl).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                console.log(data);
                // Will be an empty array if we entered an invalid location
                if (data.length>0){
                    getOneCallData(data[0].lat,data[0].lon,cityName);
                } else {
                    alert('Please enter a valid city name.');
                }
            })
        }
    })
}

var saveCityName = function(city){
    var cityArray = city.split(" ");
    for (var i = 0; i < cityArray.length; i++){
        cityArray[i] = cityArray[i][0].toUpperCase() + cityArray[i].substr(1);
    }
    city = cityArray.join(' ');
    // Prevents the same city from being added again
    if(cityHistory.indexOf(city) < 0){
        cityHistory.unshift(city);
        createHistoryItem(city);
        saveHistory();
    }
}

var createHistory = function(){
    for (var i = 0; i < cityHistory.length; i++){
        createHistoryItem(cityHistory[i]);
    }
}

var createHistoryItem = function(city){
    var btnEl = $('<button>').addClass('btn btn-outline-primary w-100 my-2');
    btnEl.text(city);
    historyEl.prepend(btnEl);
}

var saveHistory = function(){
    if(cityHistory.length > 0){
        localStorage.setItem(localStorageKey,JSON.stringify(cityHistory));
    }
}

function loadSchedule() {
    cityHistory = localStorage.getItem(localStorageKey);
    if (!cityHistory){
        cityHistory = [];
    } else {
        cityHistory = JSON.parse(cityHistory);
        createHistory();
    }
};

cityFormEl.addEventListener('submit',formSubmitHandler);

loadSchedule();