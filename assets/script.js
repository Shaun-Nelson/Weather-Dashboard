var apiKey = "ba54dedca73331de3e7f6563af185e4e";
var searchBtn = $(".btn-search");
var clearBtn = $(".clear");
var input = $("#form1");

function handleSubmit() {
  var userInput = input.val().trim().toUpperCase();
  input.val("");
  if (userInput) {
    var coordinatesEndpoint = `https://api.openweathermap.org/geo/1.0/direct?q=${userInput}&appid=${apiKey}`;

    $.ajax(coordinatesEndpoint).then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      var forecastEndpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      $.ajax(forecastEndpoint).then(function (data) {
        console.log(data);
        setHistory(userInput, { lat: lat, lon: lon });
        getForecast(lat, lon);
      });
    });
    if (window.localStorage.getItem(`wd-${userInput}`) === null) {
      createBtn(userInput);
    }
  }
}

function setHistory(city, coordinates) {
  window.localStorage.setItem(`wd-${city}`, JSON.stringify(coordinates));
}

function getHistory() {
  // From Stack Overflow: uses spread operator to retrieve all
  // entries in local storage as an object
  var cities = { ...localStorage };
  for (var city in cities) {
    // selects only key/value pairs related to this project
    if (city.startsWith("wd-")) {
      createBtn(city.slice(3));
    }
  }
}

function createBtn(city) {
  var btn = document.createElement("button");
  $(btn).text(city).addClass("my-1 mx-1 w-100 btn btn-primary");
  $(".input-group").append(btn);

  $(btn).click(function () {
    var coordinates = JSON.parse(window.localStorage.getItem(`wd-${city}`));
    getForecast(coordinates.lat, coordinates.lon);
  });

  return btn;
}

function getForecast(lat, lon) {
  $.ajax(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  ).then(function (data) {
    var icon = document.createElement("img");
    $(icon).attr(
      "src",
      `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png`
    );
    // TODO get next day properly
    var filteredData = [];
    for (var i = 0; i < data.list.length; i += 7) {
      // slices out current day from data and gets next 5 day's forecast
      var sliced = data.list.slice(11);
      filteredData.push(sliced[i]);
    }

    var date = dayjs.unix(data.list[0].dt).format("M/D/YYYY");
    var name = data.city.name;
    var temp = data.list[0].main.temp.toFixed(2);
    var wind = data.list[0].wind.speed.toFixed(2);
    var humidity = data.list[0].main.humidity;

    $(".card").css("display", "block");
    $(".current-header").text(`${name} ${date}`);
    $(".current-header").append(icon);
    $(".current-temp").text(`Temp: ${temp} °C`);
    $(".current-wind").text(`Wind: ${wind} KPH`);
    $(".current-humidity").text(`Humidity: ${humidity} %`);

    $(".five-day-header").css("display", "block");
    $(`.date`).each(function (index) {
      $(this).text(dayjs.unix(filteredData[index].dt).format("M/D/YYYY"));
    });
    $(`.icon`).each(function (index) {
      var icon = document.createElement("img");
      $(icon).attr(
        "src",
        `https://openweathermap.org/img/wn/${filteredData[index].weather[0].icon}.png`
      );
      $(this).html(icon);
    });
    $(`.temp`).each(function (index) {
      console.log();
      $(this).text(`Temp: ${filteredData[index].main.temp.toFixed(2)} °C`);
    });
    $(`.wind`).each(function (index) {
      $(this).text(`Wind: ${filteredData[index].wind.speed.toFixed(2)} KPH`);
    });
    $(`.hum`).each(function (index) {
      $(this).text(`Humidity: ${filteredData[index].main.humidity} %`);
    });
  });
}

searchBtn.click(function (event) {
  event.preventDefault();
  handleSubmit();
});

input.keypress(function (event) {
  if (event.key === "Enter") {
    handleSubmit();
  }
});

clearBtn.click(function () {
  window.localStorage.clear();
  window.location.reload();
});

getHistory();
