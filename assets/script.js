var apiKey = "ba54dedca73331de3e7f6563af185e4e";
var searchBtn = $(".btn-search");
var input = $("#form1");

getHistory();

searchBtn.click(function (event) {
  event.preventDefault();

  var userInput = input.val().toUpperCase();
  if (userInput) {
    var coordinatesEndpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${userInput}&appid=${apiKey}`;

    $.ajax(coordinatesEndpoint).then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      var forecastEndpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      $.ajax(forecastEndpoint).then(function (data) {
        addToHistory(userInput, { lat: lat, lon: lon });

        getForecast(lat, lon);
      });
    });
    if (!window.localStorage.getItem(userInput)) {
      createBtn(userInput);
    }
  }
});

function addToHistory(city, coordinates) {
  window.localStorage.setItem(`wd-${city}`, JSON.stringify(coordinates));
}

function getHistory() {
  var cities = { ...localStorage };
  for (var city in cities) {
    if (city.startsWith("wd-")) createBtn(city.slice(3));
  }
}

$(".clear").click(function () {
  window.localStorage.clear();
  window.location.href = "./index.html";
});

function createBtn(city) {
  var cityBtn = document.createElement("button");
  $(cityBtn).text(city).addClass("my-1 mx-1 w-100 btn btn-primary");
  $(".container-col").append(cityBtn);

  $(cityBtn).click(function () {
    var coordinates = JSON.parse(window.localStorage.getItem(`wd-${city}`));
    getForecast(coordinates.lat, coordinates.lon);
  });

  return cityBtn;
}

function getForecast(lat, lon) {
  $.ajax(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
  ).then(function (data) {
    var icon = document.createElement("img");
    $(icon).attr(
      "src",
      `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png`
    );

    var name = data.city.name;
    var date = dayjs.unix(data.list[0].dt).format("M/D/YYYY");
    var temp = (data.list[0].main.temp - 273.15).toFixed(2);
    var wind = (data.list[0].wind.speed * 1.6).toFixed(2);
    var humidity = data.list[0].main.humidity;

    $(".current-forecast").css("display", "block");
    $(".current-header").text(`${name} ${date}`);
    $(".current-temp").text(`Temp: ${temp} °C`);
    $(".current-wind").text(`Wind: ${wind} KPH`);
    $(".current-humidity").text(`Humidity: ${humidity} %`);
    $(".current-header").append(icon);
  });
}
