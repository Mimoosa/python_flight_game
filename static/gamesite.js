'use strict';

//leaflet and openstreetmap
const gamesite = L.map('map').setView([55, 10], 3.5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(gamesite);

// global variables
const slashRegEx = new RegExp('/','g');
const questionRegEx = new RegExp('[?]', 'g');
const airportMarkers = L.featureGroup().addTo(gamesite);
const polyLines = L.featureGroup().addTo(gamesite);
let destinationApLine = L.featureGroup().addTo(gamesite);
const batteryLevel = document.getElementById('battery-level');
let battery = 2000;
const currentScore = document.getElementById('current-score');
let points = 0;
const visited_airports = [];
// Alustetaan muuttujat username ja aircraft
//let username; NÄMÄ MUOKATAAN OIKEIKSI
//let aircraft; NÄMÄ MUOKATAAN OIKEIKSI
let screen_name;
let aircraft_name;

// Apufunktio ikonin hakemiseksi tyypin mukaan
function getIconByType(type) {
  switch (type) {
    case 'small': return smallIcon;
    case 'medium': return mediumIcon;
    case 'large': return largeIcon;
    default: return currentApIcon;
  }
}

// map's icons
const mapIconApiKey = '5f441c61c4b94cbf8a5b278d8c69c2dd'

const currentApIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon/?type=material&color=%23000000&size=xx-large&icon=plane&iconType=awesome&scaleFactor=2&apiKey=${mapIconApiKey}`,
  iconSize: [50, 74.3], // size of the icon
  iconAnchor: [25, 65], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -70] // point from which the popup should open relative to the iconAnchor
});

const largeIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%23ff0000&size=x-large&scaleFactor=2&apiKey=${mapIconApiKey}`,
  iconSize: [40, 59.3], // size of the icon
  iconAnchor: [17, 50], // point of the icon which will correspond to marker's location
  popupAnchor: [1.5, -55] // point from which the popup should open relative to the iconAnchor
});

const mediumIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%23ffea00&size=large&scaleFactor=2&apiKey=${mapIconApiKey}`,
  iconSize: [31, 46], // size of the icon
  iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -45] // point from which the popup should open relative to the iconAnchor
});

const smallIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%2312ff00&scaleFactor=2&apiKey=${mapIconApiKey}`,
  iconSize: [20, 29.8], // size of the icon
  iconAnchor: [14, 25], // point of the icon which will correspond to marker's location
  popupAnchor: [-2, -27] // point from which the popup should open relative to the iconAnchor
});


//TÄSSÄ SÄÄIKONI MUKAAN:
const apiKey = "751e2dc779f4599493c66f9be78c7809"; //vaihda tämä omaan apiavaimeen
async function fetchWeather(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            const temperatureKelvin = data.main.temp;
            const temperatureCelsius = kelvinToCelsius(temperatureKelvin);
            const weatherMain = data.weather[0].main;  // Sään kuvaus mainista
            const iconCode = data.weather[0].icon;  // Sääikoni koodi
            const temperature = temperatureCelsius;  // Lämpötila
            const temperatureMin = kelvinToCelsius(data.main.temp_min);  // Lämpötila-alue: min
            const temperatureMax = kelvinToCelsius(data.main.temp_max);  // Lämpötila-alue: max
            const windSpeed = data.wind.speed; // tuulen nopeus
            return { weatherMain, iconCode, temperature, temperatureMin, temperatureMax, windSpeed };
        } else {
            throw new Error('Weather data fetch failed');
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}
function kelvinToCelsius(kelvin) {
    return kelvin - 273.15; // Kelvinin muuntaminen celsius-asteiksi
}

async function displayWeatherIcon(latitude, longitude) {
    const weatherData = await fetchWeather(latitude, longitude);
    if (weatherData) {
        const iconUrl = `https://openweathermap.org/img/wn/${weatherData.iconCode}.png`;
        const weatherIcon = document.getElementById('weather-icon');
        weatherIcon.src = iconUrl;
        weatherIcon.alt = `Weather conditon: ${weatherData.weatherMain};`;

        const weatherTextContainer = document.getElementById('weather-text-container');
        weatherTextContainer.innerHTML = `
            <p id="weather-temperature">${weatherData.temperature.toFixed(2)} °C</p>
            <p id="weather-temperature-range">Temperature from ${weatherData.temperatureMin.toFixed(2)} °C to ${weatherData.temperatureMax.toFixed(2)} °C</p>
            <p id="weather-wind-speed">Wind ${weatherData.windSpeed.toFixed(2)} m/s</p>
        `;
    }
}
// get a multiplier to a distance between airports and information about a battery usage because of a weather through Flask
async function weatherMultiplier(latitude, longitude){
  try{
      const response = await fetch(`http://127.0.0.1:3000/get_multiplier_and_weather_message/${latitude}/${longitude}`);
      const jsonData = await response.json();
      if(!response) throw new Error;
      return jsonData
  } catch (error){
    console.log(error.message);
  }
}

//KOKEILLAAN LISÄTÄ AKKU FUNKTIO MISSÄ BATTERYBOX VÄRI MUUTTUU
function updateBatteryLevel(newBatteryLevel) {
    batteryLevel.textContent = `${newBatteryLevel.toFixed(2)} km`;
    const batteryBox = document.querySelector('.battery-box');
    const batteryPercentage = (newBatteryLevel / 2000) * 100;

    if (batteryPercentage > 50) {
        batteryBox.className = 'battery-box battery-high';
    } else if (batteryPercentage > 25) {
        batteryBox.className = 'battery-box battery-medium';
    } else {
        batteryBox.className = 'battery-box battery-low';
    }
}

// Apufunktio pistemäärän hakemiseksi kentän tyypin mukaan
function getPointsByType(type) {
  switch (type) {
    case 'small': return 1;
    case 'medium': return 3;
    case 'large': return 5;
    default: return 0;
  }
}



// Start the game by asking players for information.
  askPlayersInfo();

 function askPlayersInfo() {
    // Pyydetään käyttäjänimeä prompt-ikkunalla, kunnes kelvollinen syöte annetaan tai käyttäjä painaa "Peruuta"
    do {
      // prompt-funktio avaa ikkunan ja tallentaa käyttäjän antaman syötteen muuttujaan username
      screen_name = prompt('Enter your username');
      // Tarkistetaan, onko syöte tyhjä tai peruutetaanko ikkuna
      if (screen_name === null) {
        return; // Palataan takaisin, jos käyttäjä painaa "Peruuta"
      }
    } while (!screen_name || !screen_name.trim()); // Tarkistetaan, onko syöte tyhjä tai pelkkiä välilyöntejä, jos on, niin silmukka toistuu

    // Pyydetään lentokoneen tietoja prompt-ikkunalla, kunnes kelvollinen syöte annetaan tai käyttäjä painaa "Peruuta"
    do {
      // prompt-funktio avaa ikkunan ja tallentaa käyttäjän antaman syötteen muuttujaan aircraft
      aircraft_name = prompt('The name of your aircraft');
      // Tarkistetaan, onko syöte tyhjä tai painaako käyttäjä "Peruuta"
      if (aircraft_name === null) {
        return; // Palataan takaisin, jos käyttäjä painaa "Peruuta"
      }
    } while (!aircraft_name || !aircraft_name.trim());

    // Käyttäjän antamat tiedot
    const message = `Username: ${screen_name}\nAircraft: ${aircraft_name}`;

    // Vahvistusikkuna
    if (confirm(`${message}\nPress OK to start the adventure!`)) {
      // Jos käyttäjä painaa OK-painiketta, aloitetaan pelia
      getFirstAp();
    }
  }

  //TÄHÄN ALLE LISÄÄN MUOKATUT PELIFUNKTIOT MISSÄ SÄÄIKONIT OTETAAN MUKAAN:
async function getFirstAp() {
  try {
    const response = await fetch('http://127.0.0.1:3000/first_airport');
    if (!response.ok) throw new Error;
    const jsonData = await response.json();
    visited_airports.push(jsonData.icao);
    batteryLevel.innerHTML = `${battery}km`;
    currentScore.innerHTML = '0 points';
    displayWeatherIcon(jsonData.latitude, jsonData.longitude);  // Päivitä sääikoni aloituskentälle
    continueGame(jsonData);
  } catch (error) {
    console.log(error.message);
  }
}

async function continueGame(data) {
  try {
    airportMarkers.clearLayers();
    let apName = data.airport_name
    //"If an airport's name includes '/' or '?', they will be replaced by '-' to prevent errors when making an HTTP request."
    console.log(apName);
    apName = apName.replace(slashRegEx, '-').replace(questionRegEx, '-');
    console.log(apName);
    //Send a first/current airport's information to python to get three destinations.
    const response = await fetch(`http://127.0.0.1:3000/destinations/${data.iso_country}/${data.icao}/${apName}/${data.latitude}/${data.longitude}/${data.country}/${visited_airports}`);
    if (!response.ok) throw new Error;
    const jsonData = await response.json();
    console.log(jsonData);
    //set markers and popups for a current airport and for three different airport options.
    jsonData.forEach((airport) => {
      console.log(airport);
      const latitude = parseFloat(airport.latitude);
      const longitude = parseFloat(airport.longitude);
      const type = airport.type;
      const marker = L.marker([latitude, longitude], {icon: largeIcon}).addTo(gamesite);
      airportMarkers.addLayer(marker);
      if (airport.active) {
        // Zoom to a destination airport.
        gamesite.flyTo([latitude, longitude], 10);
        //Guide a player to a next desitnation in popup.
        marker.bindPopup(`You are at <b>${airport.airport_name}</b> in ${airport.country}.<br><br>Choose your next destination from three options and click a button in the marker popup to fly there!`);
        marker.openPopup();
        marker.setIcon(currentApIcon);
        displayWeatherIcon(latitude, longitude);  // Päivitä sääikoni kullekin aktiiviselle kentälle
      } else {
        marker.setIcon(getIconByType(type)); // Aseta ikoni kentän tyypin mukaan
        destinationApts(airport, getPointsByType(type), marker, data); // PopUp-toiminto kentän tyypin mukaan
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function destinationApts(ap, p_ints, m_ker, d_ta) {
    const popupContent = document.createElement('div');
    const h4 = document.createElement('h4');
    h4.innerHTML = ap.airport_name;
    popupContent.append(h4);
    const goButton = document.createElement('button');
    goButton.classList.add('button')
    goButton.innerHTML = 'Fly here';
    popupContent.append(goButton);
    const p = document.createElement('p');
    p.innerHTML = `Distance: ${ap.distance.toFixed(2)} km<br>Point: ${p_ints} points.`;
    popupContent.append(p);
    m_ker.bindPopup(popupContent);
    //remove a red polyline from the map
    destinationApLine.clearLayers();
    // draw three blue colored polylines to option airports.
    const latlngs = [
                [d_ta.latitude, d_ta.longitude],
                [ap.latitude, ap.longitude]
            ];
    const ap_lines = L.polyline(latlngs, {color: '#22b2da'}).addTo(gamesite);
    polyLines.addLayer(ap_lines)
    goButton.addEventListener('click', async function(evt) {
        visited_airports.push(ap.icao)
      //remove blue colored lines from the map
        polyLines.clearLayers();
        // draw a red polyline to a next destination.
        const latlngs = [
                [d_ta.latitude, d_ta.longitude],
                [ap.latitude, ap.longitude]
            ];
        const destinationLine = L.polyline(latlngs, {color: '#f23557'}).addTo(gamesite);
        destinationApLine.addLayer(destinationLine);
        // get a weather multiplier and a message from a weather class in python.
        const data = await weatherMultiplier(ap.latitude, ap.longitude);
        const multiplier = parseFloat(data.multiplier_number);
        const alertMessage = data.alert_message;
        // the battery usage changes by a weather affect
        battery -= ap.distance * multiplier;
        // information of the battery usage because of a weather
        alert(alertMessage);

        // Check whether to continue the game or declare a game over based on the remaining battery.
        if (battery > 0) {
            updateBatteryLevel(battery); //TÄMÄ LISÄTTIIN, KUTSUTAAN AKKU FUNKTIOTA .ALLA OLEVA KOMMENTIKSI
            //batteryLevel.innerHTML = `${battery.toFixed(2)}km`;
          //adding points.
            points += p_ints;
            currentScore.innerHTML = `${points} points`;
            continueGame(ap);
        } else {
            const final_icao_code = ap.icao;
            batteryLevel.innerHTML = '0 km';
            gameOverModal(screen_name, aircraft_name, final_icao_code, points);
        }
    });
}

function gameOverModal(screen_name, aircraft_name, final_icao, score){
    const dialog = document.querySelector('dialog');
    const gameOverMessage = document.getElementById('game_over_message');
    gameOverMessage.innerHTML = `Your airplane's battery is empty. The game has ended.<br>Your total points are: ${score}`
    dialog.showModal();
    console.log(final_icao);
    saveGameData(screen_name,aircraft_name,final_icao, score);//KÄYTETÄÄN TIETOJEN TALLENNUS FUNKTIOTA
}

function saveGameData(screen_name,aircraft_name, icao, score) {
    console.log(icao)
    const data = {
        screen_name: screen_name,
        aircraft: aircraft_name,
        final_location: icao,
        score: score

    };
    console.log(data);
    fetch('http://127.0.0.1:3000/save-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Data saved successfully:', data);
    })
    .catch(error => {
        console.error('Error in saving data:', error);
    });
}
