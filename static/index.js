document.addEventListener('DOMContentLoaded', function () {
  // Connect to the SocketIO server
  const socket = io.connect('https://' + document.domain + ':' + location.port);

  // Update Sensor 1 data
  socket.on('sensor1_data', function (data) {
      // Update HTML elements with the received data
      document.querySelector('.sensor1 p.tilt').textContent = `Tilt: ${data.tilt} degrees`;
      document.querySelector('.sensor1 p.acceleration').textContent = `Acceleration: ${data.acceleration} m/s²`;
  });

  // Update Sensor 2 data
  socket.on('sensor2_data', function (data) {
      // Update HTML elements with the received data
      document.querySelector('.sensor2 p.tilt').textContent = `Tilt: ${data.tilt} degrees`;
      document.querySelector('.sensor2 p.acceleration').textContent = `Acceleration: ${data.acceleration} m/s²`;
  });

  // Fetch weather data from the API
  fetchWeatherData();

  function fetchWeatherData() {
      // Listen for the 'weather_data' event from the server
      socket.on('weather_data', function (weatherData) {
          // Handle the received weather data
          displayWeatherData(weatherData);
      });
  }

  function displayWeatherData(data) {
      const weatherBoardcastElement = document.getElementById('weather-boardcast');

      // Extract relevant weather information from the data
      const temperature = data.temperature;
      const description = data.weather_description;
      const precipitation = data.precipitation;
      const humidity = data.humidity;
      const windSpeed = data.wind_speed;
      const windDirection = data.wind_direction;

      // Update the weather broadcast element
      weatherBoardcastElement.innerHTML = `
          <h4 class="text-success">Server Data</h4>
          <p>Current Temperature: ${temperature}°C</p>
          <p>Weather Description: ${description}</p>
          <p>Precipitation: ${precipitation} mm</p>
          <p>Humidity: ${humidity}%</p>
          <p>Wind Speed: ${windSpeed} km/h</p>
          <p>Wind Direction: ${windDirection}°</p>
      `;
  }


    // Initialize the map
  var map = L.map("map");

  // Add OpenStreetMap as the base map layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  // Attempt to get the user's current location
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // If successful, center the map around the user's location
      var userLocation = [position.coords.latitude, position.coords.longitude];
      map.setView(userLocation, 11);

      // Sample locations with different emergency levels
      var locations = [
        { coordinates: [32.6599, 77.2494], level: 'emergency', message: 'Avalanche in Himachal Pradesh' },
        { coordinates: [34.1526, 77.5771], level: 'warning', message: 'Possible Avalanche in Jammu and Kashmir' },
        { coordinates: [35.3191, 78.5665], level: 'good', message: 'Safe Zone in Ladakh' },
        { coordinates: [30.8827, 77.6110], level: 'emergency', message: 'Urgent Alert in Uttarakhand' },
        { coordinates: [33.7782, 76.5762], level: 'warning', message: 'Potential Danger in Punjab' },
        { coordinates: [31.1471, 77.1089], level: 'good', message: 'No Threat in Himachal Pradesh' },
      ];

      // Define icon colors based on emergency levels
      var iconColors = {
        'emergency': 'red',
        'good': 'green',
        'warning': 'yellow',
      };

      locations.forEach(function (location) {
        var marker = L.marker(location.coordinates, {
          icon: L.divIcon({
            className: 'custom-marker marker-' + iconColors[location.level],
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          })
        }).addTo(map);

        // Add tooltip to show information on hover
        marker.bindTooltip(location.message, {
          permanent: true,
          direction: 'top',
          opacity: 0.7
        }).openTooltip();
      });
    },
    function (error) {
      // Handle errors if geolocation is not supported or permission is denied
      console.error('Error getting user location:', error.message);
      map.setView([32.6599, 77.2494, 10]);
    }
  );

});
