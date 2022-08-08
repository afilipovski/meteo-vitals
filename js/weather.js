import { URLRequest } from "./api_utils.js"
import * as ll from "./localisation.js"

export function createCard() {
    const card = document.createElement('div');
    card.classList.add('card'); card.classList.add('cols');
    const close = document.createElement('img'); close.classList.add('close');
    close.setAttribute('src','../images/Black_close_x.svg');
    card.append(close);
    const firstDiv = document.createElement('div');
        const name = document.createElement('h2'); name.classList.add('name');
        const pressureContainer = document.createElement('p');
            const pressureText = document.createElement('span'); pressureText.classList.add('pressure-text');
            const pressureSpan = document.createElement('span'); pressureSpan.classList.add('pressure');
        pressureContainer.append(pressureText); pressureContainer.append(pressureSpan);
        const humidityContainer = document.createElement('p');
        const humidityText = document.createElement('span'); humidityText.classList.add('humidity-text');
        const humiditySpan = document.createElement('span'); humiditySpan.classList.add('humidity');
        humidityContainer.append(humidityText); humidityContainer.append(humiditySpan);
    firstDiv.append(name); firstDiv.append(pressureContainer); firstDiv.append(humidityContainer);
    card.append(firstDiv);
    const secondDiv = document.createElement('div');
        const image = document.createElement('img'); image.classList.add('weather-icon');
        const temperature = document.createElement('h3'); temperature.classList.add('temperature');
        const feelsLikeContainer = document.createElement('h5');
            const feelsLikeTextLocal = document.createElement('span'); feelsLikeTextLocal.classList.add('feels-like-text');
            const feelsLikeTemp = document.createElement('span'); feelsLikeTemp.classList.add('feels-like');
        feelsLikeContainer.append(feelsLikeTextLocal); feelsLikeContainer.append(feelsLikeTemp);
        secondDiv.append(image); secondDiv.append(temperature); secondDiv.append(feelsLikeContainer);
    card.append(secondDiv);
    return card;
}

function getIconURL(icon) {return `https://openweathermap.org/img/wn/${icon}@2x.png`}

export function fillElement(element, id, staticsObject, weatherObject) {
    if (element.classList.contains('favorite-container')) {
        if (id === placesStored['favId'])
            element.querySelector('#home').classList.remove('active');
        else
            element.querySelector('#home').classList.add('active');
        if (!placesStored['statics'].hasOwnProperty(id))
            element.querySelector('#add').classList.add('active');
        else
            element.querySelector('#add').classList.remove('active');
    } 
    element.id = id;
    element.querySelector('.name').innerHTML = ll.getLocalisedPlaceName(staticsObject);
    element.querySelector('.temperature').innerHTML = ll.getLocalisedTemperature(weatherObject.currentWeather.temp);
    element.querySelector('.feels-like-text').innerHTML = ll.getLocalisedText('feels-like') + " ";
    element.querySelector('.feels-like').innerHTML = ll.getLocalisedTemperature(weatherObject.currentWeather.realFeel);
    element.querySelector('.pressure-text').innerHTML = ll.getLocalisedText('pressure') + ": ";
    element.querySelector('.pressure').innerHTML = ll.getLocalisedPressure(weatherObject.currentWeather.pressure);
    element.querySelector('.humidity-text').innerHTML = ll.getLocalisedText('humidity') + ": ";
    element.querySelector('.humidity').innerHTML = weatherObject.currentWeather.humidity+"%";
    element.querySelector('.weather-icon').src = getIconURL(weatherObject.currentWeather.icon);
    if (element.querySelector('.aqi')) {
        element.querySelector('.aqi').innerHTML = weatherObject.pollution;
    }
    if (element.querySelector('.forecast')) {
        const hourlyArr = element.querySelector('.hourly').querySelectorAll('div');
        for (let i=0; i<8; i++) {
            hourlyArr[i].querySelector('img').src = getIconURL(weatherObject['forecast']['hourlyForecast'][i]['icon']);
            hourlyArr[i].querySelectorAll('h5')[0].innerHTML = ll.getLocalisedTemperature(weatherObject['forecast']['hourlyForecast'][i]['temp']);
            hourlyArr[i].querySelectorAll('h5')[1].innerHTML = ll.getLocalisedTime(weatherObject['forecast']['hourlyForecast'][i]['hour']);
        }
        const dailyArr = element.querySelector('.daily').querySelectorAll('.cols');
        for (let i=0; i<4; i++) {
            dailyArr[i].querySelector('img').src = getIconURL(weatherObject['forecast']['dailyForecast'][i]['icon']);
            dailyArr[i].querySelector('.date').innerHTML = ll.getLocalisedDate(weatherObject['forecast']['dailyForecast'][i]['date']);
            dailyArr[i].querySelector('.low').innerHTML = ll.getLocalisedTemperature(weatherObject['forecast']['dailyForecast'][i]['low']);
            dailyArr[i].querySelector('.high').innerHTML = ll.getLocalisedTemperature(weatherObject['forecast']['dailyForecast'][i]['high']);
        }
    }
}

export function unixHours(ut) {
    const date = new Date(ut*1000);
    return date.getUTCHours();
}
export function unixDate(ut) {
    const date = new Date(ut * 1000);
    return {
        day : date.getUTCDate(),
        month : date.getUTCMonth() + 1,
        year : date.getUTCFullYear()
    }
}

//(1) se povikuva za azuriranje na objekt vreme
export async function getCurrentWeather({latitude : lat, longitude : lon}) {
    if (localAPICalls)
        var raw = await URLRequest(`../api_local/curr_weather.json`);
    else
        var raw = await URLRequest(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=d8924a5f87ce36dea6afc7dddbd53f1f&units=metric&lang=mk`);
    
    return {
        nameMK : raw["name"],
        currentWeather : {
            dt : raw["dt"], //vreme na povikot
            id : raw["weather"][0]["id"],
            icon: raw["weather"][0]["icon"],
            temp : raw["main"]["temp_min"],
            realFeel : raw["main"]["feels_like"],
            pressure : raw["main"]["pressure"],
            humidity : raw["main"]["humidity"],
            clouds : raw["clouds"]["all"],
            time : {
                sunrise : raw["sys"]["sunrise"],
                sunset : raw["sys"]["sunset"]
            }
        }
    }
}

//(1) se povikuva za azuriranje na prognoza
export async function getForecast({latitude : lat, longitude : lon}) {
    if (localAPICalls)
        var raw = await URLRequest(`../api_local/forecast.json`);
    else
        var raw = await URLRequest(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=d8924a5f87ce36dea6afc7dddbd53f1f&units=metric`);
    
    //KORISNI PROMENLIVI
    const timezone = raw['city']['timezone'];

    return {
        nameEN : raw["city"]["name"],
        forecast : {
            dt : raw["list"][0]["dt"],
            hourlyForecast : (() => {
                let res = [];
                for (let i=0; i<8; i++)
                    res.push({
                        temp : raw["list"][i]["main"]["temp_min"],
                        hour : unixHours(raw["list"][i]["dt"] + raw["city"]["timezone"]),
                        icon : raw["list"][i]["weather"][0]["icon"]
                    });
                return res;
            })(),
            dailyForecast : (() => {
                let i=1;
                let currentDay = new Date();
                currentDay = currentDay.getDate();
                console.log("Today is the "+currentDay+"th");
                const dateOfIndex = (index) => {
                    return unixDate(raw["list"][index]["dt"] + raw["city"]["timezone"]);
                }
                while(currentDay === dateOfIndex(i).day && i<40) i++;
                let res = [];
                let minTemp, maxTemp;
                minTemp = maxTemp = raw["list"][i]["main"]["temp_min"];
                let counts = {};
                while(i<40) {
                    if (dateOfIndex(i-1).day !== currentDay && dateOfIndex(i-1).day !== dateOfIndex(i).day) {
                        if (typeof minTemp !== 'undefined') { //Za da se izbegne push na prazni podatoci
                            let maxIcon;
                            for (let x in counts) {
                                if (typeof maxIcon === 'undefined') maxIcon = x;
                                if (counts[x] > counts[maxIcon]) {
                                    maxIcon = x;
                                }
                            }
                            res.push({
                                low : minTemp,
                                high : maxTemp,
                                date : dateOfIndex(i-1),
                                icon : maxIcon
                            });
                        }
                        minTemp = maxTemp = raw["list"][i]["main"]["temp_min"];
                        counts = {};
                    }
                    let temp = raw["list"][i]["main"]["temp_min"];
                    maxTemp = (temp > maxTemp) ? temp : maxTemp;
                    minTemp = (temp < minTemp) ? temp : minTemp;
                    let icon = raw["list"][i]["weather"][0]["icon"];
                    if (icon[icon.length-1] === 'n') {
                        if (debug)
                            console.log(`Transforming ${icon} into ${icon.slice(0,icon.length-1) + 'd'}`);
                        icon = icon.slice(0,icon.length-1) + 'd';
                    }
                        counts[icon] = counts.hasOwnProperty(icon) ? counts[icon]+1 : 1;
                    //Moze da se zgolemi bias za dozdlivo vreme i sl.
                    i++;
                }
                return res;
            })()
        }
    }
}

//(1) se povikuva za azuriranje na aerozagaduvanje
export async function getPollution({latitude : lat, longitude : lon}) {
    if (localAPICalls)
        var raw = await URLRequest(`../api_local/pollution.json`);
    else
        var raw = await URLRequest(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=d8924a5f87ce36dea6afc7dddbd53f1f`);
    
    return {
        pollution : raw["list"][0]["main"]["aqi"]
    }
}

export async function geolocate(name) {
    if (!localAPICalls)
        var raw = await URLRequest(`https://api.openweathermap.org/geo/1.0/direct?q="${name}"&limit=1&appid=d8924a5f87ce36dea6afc7dddbd53f1f`);
    else
        var raw = await URLRequest("../api_local/geolocation.json");
    return {
        nameEN: raw[0]['local_names']['en'] || raw[0]['name'],
        nameMK: raw[0]['local_names']['mk'] || raw[0]['local_names']['en'] || raw[0]['name'],
        latitude : raw[0]['lat'],
        longitude : raw[0]['lon']
    }
}

export function locToId({latitude : lat, longitude : lon}) {
    lat = Math.trunc(lat * Math.pow(10,decimalPrecision));
    lon = Math.trunc(lon * Math.pow(10,decimalPrecision));
    return lat.toString() + '_' + lon.toString();
}

export function idToLoc(id) {
    id = id.split('_');
    return {
        latitude : parseInt(id[0])/Math.pow(10,decimalPrecision),
        longitude : parseInt(id[1])/Math.pow(10,decimalPrecision)
    }
}