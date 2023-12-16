document.addEventListener("DOMContentLoaded", function () {
  // Connect to the SocketIO server
  const socket = io.connect(
    this.location.protocol + this.location.hostname === "localhost"
      ? "127.0.0.1:5000"
      : this.location.hostname + ":" + this.location.port
  );

  let TiltS1 = new Array();
  let TiltS2 = new Array();
  let AccelerationS1 = new Array();
  let AccelerationS2 = new Array();

  const UpdationWithConstraint = (arr, element, size) => {
    if (arr.length + 1 > size) {
      arr.shift(); // Remove the first element if size is exceeded
    }
    arr.push(element); // Add the new element to the array
    return arr;
  };

  const chartData = {
    labels: [],
    datasets: [
      {
        label: "Sensor 1 - Tilt",
        data: TiltS1,
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Sensor 2 - Tilt",
        data: TiltS2,
        borderColor: "red",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const chart2Data = {
    labels: [],
    datasets: [
      {
        label: "S1-Acceleration",
        data: AccelerationS1,
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "S2-Acceleration",
        data: AccelerationS2,
        borderColor: "red",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        min: 0,
        max: 50,
      },
    },
  };

  const chart2Options = {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        min: -15,
        max: 30,
      },
    },
  };

  const ctx = document.getElementById("tiltChart").getContext("2d");
  const ctx2 = document.getElementById("accelerationChart").getContext("2d");

  const chart = new Chart(ctx, {
    type: "line",
    data: chartData,
    options: chartOptions,
  });

  const chart2 = new Chart(ctx2, {
    type: "line",
    data: chart2Data,
    options: chart2Options,
  });

  const updateChartData = () => {
    chart.data.labels = Array.from({ length: TiltS1.length }, (_, i) => i + 1);
    chart.data.datasets[0].data = TiltS1;
    chart.data.datasets[1].data = TiltS2;
    chart.update();
  };

  const updateChart2Data = () => {
    chart2.data.labels = Array.from({ length: TiltS1.length }, (_, i) => i + 1);
    chart2.data.datasets[0].data = AccelerationS1;
    chart2.data.datasets[1].data = AccelerationS2;
    chart2.update();
  };

  socket.on("sensor1_data", function (data) {
    UpdationWithConstraint(TiltS1, data.tilt, 15);
    UpdationWithConstraint(AccelerationS1, data.acceleration, 15);
    updateChartData();
    updateChart2Data();
    document.querySelector(
      ".sensor1 p.tilt"
    ).textContent = `Tilt: ${data.tilt} degrees`;
    document.querySelector(
      ".sensor1 p.acceleration"
    ).textContent = `Acceleration: ${data.acceleration} m/s²`;
  });

  socket.on("sensor2_data", function (data) {
    UpdationWithConstraint(TiltS2, data.tilt, 15);
    UpdationWithConstraint(AccelerationS2, data.acceleration, 15);
    updateChartData();
    updateChart2Data();
    document.querySelector(
      ".sensor2 p.tilt"
    ).textContent = `Tilt: ${data.tilt} degrees`;
    document.querySelector(
      ".sensor2 p.acceleration"
    ).textContent = `Acceleration: ${data.acceleration} m/s²`;
  });

  // Fetch weather data from the API
  fetchWeatherData();

  function fetchWeatherData() {
    // Listen for the 'weather_data' event from the server
    socket.on("weather_data", function (weatherData) {
      // Handle the received weather data
      displayWeatherData(weatherData);
    });
  }

  function displayWeatherData(data) {
    const weatherBoardcastElement = document.getElementById(
      "weather-boardcast"
    );

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
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Attempt to get the user's current location
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // If successful, center the map around the user's location
      var userLocation = [position.coords.latitude, position.coords.longitude];
      map.setView(userLocation, 11);

      // Sample locations with different emergency levels
      var locations = [
        {
          coordinates: [32.6599, 77.2494],
          level: "emergency",
          message: "Avalanche in Himachal Pradesh",
        },
        {
          coordinates: [34.1526, 77.5771],
          level: "warning",
          message: "Possible Avalanche in Jammu and Kashmir",
        },
        {
          coordinates: [35.3191, 78.5665],
          level: "good",
          message: "Safe Zone in Ladakh",
        },
        {
          coordinates: [30.8827, 77.611],
          level: "emergency",
          message: "Urgent Alert in Uttarakhand",
        },
        {
          coordinates: [33.7782, 76.5762],
          level: "warning",
          message: "Potential Danger in Punjab",
        },
        {
          coordinates: [31.1471, 77.1089],
          level: "good",
          message: "No Threat in Himachal Pradesh",
        },
      ];

      // Define icon colors based on emergency levels
      var iconColors = {
        emergency: "red",
        good: "green",
        warning: "yellow",
      };

      locations.forEach(function (location) {
        var marker = L.marker(location.coordinates, {
          icon: L.divIcon({
            className: "custom-marker marker-" + iconColors[location.level],
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(map);

        // Add tooltip to show information on hover
        marker
          .bindTooltip(location.message, {
            permanent: true,
            direction: "top",
            opacity: 0.7,
          })
          .openTooltip();
      });
    },
    function (error) {
      // Handle errors if geolocation is not supported or permission is denied
      console.error("Error getting user location:", error.message);
      map.setView([32.6599, 77.2494, 10]);
    }
  );
  

  socket.on("prediction", function (prediction) {
    // Update the HTML content with the received prediction
    document.getElementById("prediction-text").innerText =
      "Prediction: " + prediction;
    if (prediction == "Avalanche Possible") {
      var img = document.querySelector(".wimg");
      img.src = "/static/warning.png";
    }
    else{
      var img = document.querySelector(".wimg");
      img.src = "/static/safe.png";
    }
  });
});
