import { URLRequest } from "./api_utils.js"

export async function getCurrentWeather({latitude : lat, longitude : lon}) {
    let raw = await URLRequest(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=d8924a5f87ce36dea6afc7dddbd53f1f&units=metric&lang=mk`);
    return {
        statics: {
            lat : raw["coord"]["lat"],
            lon : raw["coord"]["lon"],
            id : raw["id"],
            nameMK : raw["name"]
        },
        data : {
            dt : raw["dt"], //vreme na povikot
            id : raw["weather"][0]["id"],
            temp : raw["main"]["temp"],
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

export async function getForecast({latitude : lat, longitude : lon}) {
    let raw = await URLRequest(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=d8924a5f87ce36dea6afc7dddbd53f1f&units=metric`);
    return {
        statics : {
            nameEN : raw["city"]["name"]
        },
        data : {
            dt : raw["list"][0]["dt"],
            hourlyForecast : (() => {
                let res = [];
                for (let i=1; i<=8; i++)
                    res.push({
                        temp : raw["list"][i]["main"]["temp"],
                        id : raw["list"][i]["weather"][0]["id"],
                        hour : raw["list"][i]["dt_txt"].slice(11,13)
                    });
                return res;
            })(),
            dailyForecast : (() => {
                let i=0;
                while(raw["list"][i]["dt_txt"].slice(11,13) !== "00" && i<40) i++;
                let res = [];
                let minTemp, maxTemp;
                let counts = {};
                while(i<40) {
                    if (raw["list"][i]["dt_txt"].slice(11,13) === "00") {
                        if (typeof minTemp !== 'undefined')
                            res.push({
                                low : minTemp,
                                high : maxTemp,
                                id : (() => {
                                    console.log(counts);
                                    let maxID;
                                    for (let x in counts) {
                                        if (typeof maxID === 'undefined') maxID = x;
                                        if (counts[x] > counts[maxID]) {
                                            maxID = x;
                                        }
                                    }
                                    return parseInt(maxID);
                                })(),
                                date : raw["list"][i-1]["dt_txt"].slice(0,10)
                            });
                        minTemp = maxTemp = raw["list"][i]["main"]["temp"];
                        counts = {};
                    }
                    let temp = raw["list"][i]["main"]["temp"];
                    maxTemp = (temp > maxTemp) ? temp : maxTemp;
                    minTemp = (temp < minTemp) ? temp : minTemp;
                    let wid = raw["list"][i]["weather"][0]["id"];
                    counts[wid] = counts.hasOwnProperty(wid) ? counts[wid]+1 : 1;
                    i++;
                }
                return res;
            })()
        }
    }
}

export async function getPollution({latitude : lat, longitude : lon}) {
    let raw = await URLRequest(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=d8924a5f87ce36dea6afc7dddbd53f1f`);
    return {
        data: {
            dt : raw["list"][0]["dt"],
            aqi : raw["list"][0]["main"]["aqi"]
        }
    }
}

export async function getAllWeather(location) {
    let vals = await Promise.all([getCurrentWeather(location),getForecast(location),getPollution(location)]);
    return {
        statics: {...vals[0]["statics"], ...vals[1]["statics"]}, 
        currentWeather: vals[0]["data"],
        forecast: vals[1]["data"],
        pollution: vals[2]["data"]
    }
}

import { openModal, closeModal } from "./modal.js"

// openModal("get weather?", "3 api calls", [
//         {
//             type: "button", 
//             name: "yes", 
//             action: (() => {
//                 locate.remote().then((val) => getAllWeather(val).then((v2) => console.log(v2)));
//                 closeModal();
//             })
//         }
//     ]
// );