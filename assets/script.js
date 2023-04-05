var apiKey = "ba54dedca73331de3e7f6563af185e4e";
var searchBtn = $(".btn-search");
var input = $("#form1");

searchBtn.click(function (event) {
  event.preventDefault();

  if (input.val()) {
    var userInput = input.val().toUpperCase();
    var coordinatesEndpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${userInput}&appid=${apiKey}`;

    var forecast = $.ajax(coordinatesEndpoint).then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      var forecastEndpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      $.ajax(forecastEndpoint).then(function (data) {
        console.log(data);

        addToHistory(userInput, { lat: lat, lon: lon });

        createBtn(userInput);
      });
    });
  }
});

function addToHistory(city, coordinates) {
  window.localStorage.setItem(city, JSON.stringify(coordinates));
}

function createBtn(city) {
  var cityBtn = document.createElement("button");
  $(cityBtn).text(city).addClass("my-1 mx-1 w-100 btn btn-primary");
  $(".input-group").append(cityBtn);

  $(cityBtn).click(function () {
    var coordinates = JSON.parse(window.localStorage.getItem(city));
    console.log(coordinates);
  });
}
