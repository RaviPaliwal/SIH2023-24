document.addEventListener('DOMContentLoaded', function () {
  // Connect to the SocketIO server
  const socket = io.connect('http://' + document.domain + ':' + location.port);

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
});
