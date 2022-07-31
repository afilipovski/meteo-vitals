import { URLRequest } from "./api_utils.js"

async function getWeather(location) {
    let raw = await Promise.all([URLRequest("../api_local/curr_weather.json"), 
    URLRequest("../api_local/forecast.json"), 
    URLRequest("../api_local/pollution.json")]);
    return {
        coord : {
            lat : raw[0]["coord"]["lat"],
            lon : raw[0]["coord"]["lon"]
        },
        currentWeather : {
            id : raw[0]["weather"][0]["id"],
            temp : raw[0]["main"]["temp"],
            realFeel : raw[0]["main"]["feels_like"],
            pressure : raw[0]["main"]["pressure"],
            humidity : raw[0]["main"]["humidity"],
            clouds : raw[0]["clouds"]["all"],
            aqi : raw[2]["list"][0]["main"]["aqi"]
        },
        time : {
            dt : raw[0]["dt"],
            sunrise : raw[0]["sys"]["sunrise"],
            sunset : raw[0]["sys"]["sunset"]
        },
        place : {
            id : raw[0]["id"],
            nameEN : raw[1]["city"]["name"],
            nameMK : raw[0]["name"]
        },
        hourlyForecast : (() => {
            let res = [];
            for (let i=1; i<=8; i++) //raw[1]["list"][i]
                res.push({
                    temp : raw[1]["list"][i]["main"]["temp"],
                    id : raw[1]["list"][i]["weather"][0]["id"],
                    hour : raw[1]["list"][i]["dt_txt"].slice(11,13)
                });
            return res;
        })(),
        dailyForecast : (() => {
            let i=0;
            while(raw[1]["list"][i]["dt_txt"].slice(11,13) !== "00" && i<40) i++;
            let res = [];
            let minTemp, maxTemp;
            let counts = {};
            while(i<40) {
                if (raw[1]["list"][i]["dt_txt"].slice(11,13) === "00") {
                    if (typeof minTemp !== 'undefined')
                        res.push({
                            min : minTemp,
                            max : maxTemp,
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
                            date : raw[1]["list"][i-1]["dt_txt"].slice(0,10)
                        });
                    minTemp = maxTemp = raw[1]["list"][i]["main"]["temp"];
                    counts = {};
                }
                maxTemp = (raw[1]["list"][i]["main"]["temp"] > maxTemp) ? raw[1]["list"][i]["main"]["temp"] : maxTemp;
                minTemp = (raw[1]["list"][i]["main"]["temp"] < minTemp) ? raw[1]["list"][i]["main"]["temp"] : minTemp;
                let wid = raw[1]["list"][i]["weather"][0]["id"];
                counts[wid] = counts.hasOwnProperty(wid) ? counts[wid]+1 : 1;
                i++;
            }
            return res;
        })()
    }
}