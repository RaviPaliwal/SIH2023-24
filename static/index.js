        document.addEventListener("DOMContentLoaded", function () {
          // Fetch weather data from the API
          fetchWeatherData();
        });
      
        function fetchWeatherData() {
          // Connect to the WebSocket
          // const socket = io.connect('https://7f4c-2409-4085-1089-c3e4-8050-a09b-2214-f63d.ngrok-free.app/');
          const socket = io.connect("http://localhost:5000");
      
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