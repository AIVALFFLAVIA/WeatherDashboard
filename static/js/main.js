document.addEventListener("DOMContentLoaded", () => {
  const currentLocationBtn = document.getElementById("currentLocationBtn");
  const latInput = document.getElementById("lat");
  const lonInput = document.getElementById("lon");
  const weatherForm = document.getElementById("weatherForm");
  const loading = document.getElementById("loading");
  const errorElem = document.getElementById("error");
  const weatherResult = document.getElementById("weatherResult");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Show loading spinner
  function showLoading() {
    loading.style.display = "block";
    errorElem.style.display = "none";
    weatherResult.style.display = "none";
  }

  // Hide loading spinner
  function hideLoading() {
    loading.style.display = "none";
  }

  // Show error message
  function showError(message) {
    errorElem.textContent = message;
    errorElem.style.display = "block";
    weatherResult.style.display = "none";
  }

  // Handle current location button click
  currentLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        latInput.value = position.coords.latitude;
        lonInput.value = position.coords.longitude;
        // Clear city input to avoid conflict
        weatherForm.city.value = "";
        weatherForm.submit();
      },
      (error) => {
        hideLoading();
        switch(error.code) {
          case error.PERMISSION_DENIED:
            showError("Permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            showError("Position unavailable.");
            break;
          case error.TIMEOUT:
            showError("Request timed out.");
            break;
          default:
            showError("An unknown error occurred.");
        }
      }
    );
  });

  // Show loading on form submit
  weatherForm.addEventListener("submit", () => {
    showLoading();
  });

  // Dark / Light mode toggle
  function setDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add("dark-mode");
      darkModeToggle.textContent = "☀️ Light Mode";
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      darkModeToggle.textContent = "🌙 Dark Mode";
      localStorage.setItem("darkMode", "disabled");
    }
  }

  // On toggle button click
  darkModeToggle.addEventListener("click", () => {
    const enabled = document.body.classList.contains("dark-mode");
    setDarkMode(!enabled);
  });

  // Load saved dark mode preference
  if (localStorage.getItem("darkMode") === "enabled") {
    setDarkMode(true);
  }
});


// Handle unit switch without re-searching
const unitSwitcher = document.getElementById("unitSwitcher");

if (unitSwitcher) {
  unitSwitcher.addEventListener("change", () => {
    const selectedUnit = unitSwitcher.value;
    const city = document.querySelector("h2")?.textContent;

    if (!city) return;

    fetch(`/convert_units?city=${encodeURIComponent(city)}&units=${selectedUnit}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById("temperatureValue").textContent = data.temperature;
          document.getElementById("tempUnit").textContent = selectedUnit === 'metric' ? 'C' : 'F';
        } else {
          showError(data.error || "Failed to convert temperature.");
        }
      })
      .catch(() => showError("Error contacting server."));
  });
}



function updateShareLinks(city, temperature) {
  const message = `The current weather in ${city} is ${temperature}°C. Check it here!`;

  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(message)}`;
  const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(message + ' ' + location.href)}`;

  document.getElementById('twitter-share').href = twitter;
  document.getElementById('facebook-share').href = facebook;
  document.getElementById('whatsapp-share').href = whatsapp;
}


document.addEventListener("DOMContentLoaded", () => {
  // Social sharing setup (after weather data is loaded)
  const cityElem = document.querySelector(".weather-result h2");
  const tempElem = document.getElementById("temperatureValue");

  if (cityElem && tempElem) {
    const city = cityElem.textContent.trim();
    const temperature = tempElem.textContent.trim();
    updateShareLinks(city, temperature);
  }
});
