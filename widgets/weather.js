document.addEventListener('DOMContentLoaded', (e) => {
    class WeatherWidget extends HTMLElement {
        constructor() {
            super();
            //Create shadow DOM
            let shadowRoot = this.attachShadow({ mode: 'open' });
            let place = this.getAttribute('data-place') ? this.getAttribute('data-place') : "La Jolla";
            let lat = this.getAttribute('data-lat') ? this.getAttribute('data-lat') : "32.8801";
            let lon = this.getAttribute('data-lon') ? this.getAttribute('data-lon') : "-117.234";
            //Build weather template
            this.shadowRoot.innerHTML = `
                <style>
                section {
                    display: block;
                    position:relative;
                    width: 250px;
                    height: 260px;
                    border: 1px solid rgba(0,0,0,0.04);
                    box-shadow: 0 0 20px rgba(0,0,0,0.05);
                    border-radius: 5px;
                    padding: 20px;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 12px;
                    font-weight: 300;
                }
                #weather-text {
                    display: block;
                    position: relative;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 20px;
                    font-weight: 500;
                    width: 100%;
                    height: 25px;
                    line-height: 25px;
                }
                #weather-text span {
                    font-weight: 500;
                    color: #ff9b00;
                }
                .prop-wrapper {
                    display: block;
                    position: relative;
                    width: 100%;
                    height: 40px;
                    overflow: hidden;
                   margin-top: 15px;
                }
                .prop-wrapper img {
                    display: inline-block;
                    position:relative;
                    width: 20px;
                    height: 20px;
                    margin-top: 10px;
                    margin-right: 20px;
                    vertical-align: top;
                }
                .prop-wrapper span {
                    display: inline-block;
                    position:relative;
                    width: calc(100% - 20px - 50px);
                    line-height: 40px;
                    text-align: left;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    color: #3b3b3b !important;
                    vertical-align: top;
                }
                #coordinates {
                    display: block;
                    position: relative;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    color: rgba(0,0,0,0.49) !important;
                }
                </style>
                <h2>Weather widget</h2>
                <section>
                    <span id="weather-text">Weather in <span>${place}</span></span>
                    <span id="coordinates">Lat: ${lat}, Lon: ${lon}</span>
                    <div class="prop-wrapper">
                        <img id="wconditionsicon" src="./icons/weather.png" alt="weather conditions icon">
                        <span id="wconditions">Loading...</span>
                    </div>
                    <div class="prop-wrapper">
                        <img id="wtemperatureicon" src="./icons/temp.png" alt="temperature icon">
                    <span id="wtemperature">Loading...</span>
                    </div>
                    <div class="prop-wrapper">
                        <img id="wwindspeedicon" src="./icons/wind.png" alt="wind icon">
                    <span id="wwindspeed">Loading...</span>
                    </div>
                    <div class="prop-wrapper">
                        <img id="whumidityicon" src="./icons/humidity.png" alt="humidity icon">
                        <span id="whumidity">Loading...</span>
                    </div>
                </section>
            `;
            //Make request
            fetch(`https://api.weather.gov/points/${lat},${lon}`, {
                method: 'GET',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if(!data.properties.forecast) {
                    throw new Error(`No forecast data available`);
                }
                fetch(data.properties.forecast, {
                    method: 'GET',
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if(data.properties.periods.length <= 0) {
                        throw new Error(`No forecast data available`);
                    }
                    let forecast = data.properties.periods[0];
                    if( !forecast.temperature ||
                        !forecast.temperatureUnit ||
                        !forecast.shortForecast ||
                        !forecast.windSpeed ||
                        !forecast.windDirection ||
                        !forecast.relativeHumidity ||
                        !forecast.relativeHumidity.value
                    ) {
                        throw new Error(`No forecast data available`);
                    }
                    //Fill in weather values
                    shadowRoot.getElementById('wconditionsicon').src = '';
                    shadowRoot.getElementById('wconditions').innerHTML = forecast.shortForecast;

                    if(forecast.shortForecast.toLowerCase().includes('partly sunny')) {
                        shadowRoot.getElementById('wconditionsicon').src = './icons/partly-sunny.png';
                    }
                    else if(forecast.shortForecast.toLowerCase().includes('party cloudy')) {
                        shadowRoot.getElementById('wconditionsicon').src = './icons/partly-sunny.png';
                    }
                    else if(forecast.shortForecast.toLowerCase().includes('sunny')) {
                        shadowRoot.getElementById('wconditionsicon').src = './icons/sunny.png';
                    }
                    else if(forecast.shortForecast.toLowerCase().includes('cloudy')) {
                        shadowRoot.getElementById('wconditionsicon').src = './icons/cloudy.png';
                    }
                    else if(forecast.shortForecast.toLowerCase().includes('rain')) {
                        shadowRoot.getElementById('wconditionsicon').src = './icons/rainy.png';
                    }
                    else  {
                        shadowRoot.getElementById('wconditionsicon').src = './icons/weather.png';
                    }
                    shadowRoot.getElementById('wtemperature').innerHTML = forecast.temperature + " " + forecast.temperatureUnit;
                    shadowRoot.getElementById('wwindspeed').innerHTML = forecast.windSpeed + " " + forecast.windDirection;
                    shadowRoot.getElementById('whumidity').innerHTML = forecast.relativeHumidity.value +" %";
                });
            })
        }
    }

    customElements.define('weather-widget', WeatherWidget);
});