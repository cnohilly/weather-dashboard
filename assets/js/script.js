var numDaysForecast = 5;
var apiKey = '259f549c2c4387f7ce66babb16248971';
var cityInputEl = document.querySelector('#city-name');
var cityFormEl = document.querySelector('#search-form');

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

var getOneCallData = function(lat,lon){
    // Gets the one call data using latitude and longitude, excluding the hourly and minutely weather, in imperial units
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+ lat +
    '&lon=' + lon +'&exclude=hourly,minutely&units=imperial&appid='+apiKey;
    fetch(apiUrl).then(function(response){
        if(response.ok){
            response.json().then(function(data){
                console.log(data);
            })
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
                    getOneCallData(data[0].lat,data[0].lon);
                } else {
                    alert('Please enter a valid city name.');
                }
            })
        }
    })
}

cityFormEl.addEventListener('submit',formSubmitHandler);