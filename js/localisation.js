const en = {
    'search-input':'Search...',
    'sync':'Sync',
    'languageandtime':'Language & Time',
    'languagelb':'Language:',
    'timeFormatlb':'Time format:',
    '24hourlb':'24-hour',
    '12hourlb':'12-hour',
    'dateslb':'Dates:',
    'measurements':'Measurements',
    'temperaturelb':'Temperature:',
    'pressure':'Pressure',
    'pressurelb':'Pressure:',
    'feels-like':'Feels like',
    //TO-DO: opisi za vremeto
    'humidity':'Humidity',
    //TO-DO: opisi za zagaduvanje
    'error':'Error',
    'no-results':'No results were found for ',
    'logout':'Log out',
    'loggedinas':'Logged in as: '
}
const mk = {
    'search-input':'Пребарај...',
    'sync':'Синхронизација',
    'languageandtime':'Јазик и време',
    'languagelb':'Јазик:',
    'timeFormatlb':'Формат на време:',
    '24hourlb':'24-часовен',
    '12hourlb':'12-часовен',
    'dateslb':'Датуми:',
    'measurements':'Мерки',
    'temperaturelb':'Температура:',
    'pressure':'Притисок',
    'pressurelb':'Притисок:',
    'feels-like':'Се чувствува како',
    //TO-DO: opisi za vremeto
    'humidity':'Влажност',
    //TO-DO: opisi za zagaduvanje
    'error':'Грешка',
    'no-results':'Не беа пронајдени резултати за ',
    'logout':'Одјави се',
    'loggedinas':'Најавен како: '
}

const interfaceTextElements = ['loggedinas','sync','logout','languageandtime','languagelb','timeFormatlb',
'24hourlb','12hourlb','dateslb','measurements','temperaturelb','pressurelb'];
export function localiseInterface() {
    document.getElementById('search-input').placeholder = getLocalisedText('search-input');
    for (let iTEx of interfaceTextElements) {
        document.getElementById(iTEx).innerHTML = getLocalisedText(iTEx);
    }
}

export function getLocalisedText(id) {
    return (optionsStored['language'] === 'macedonian') ? mk[id] : en[id];
}
//DA SE POPRAVI
export function getLocalisedPlaceName(statics) {
    return (optionsStored['language'] === 'macedonian') ? statics['nameMK'] : statics['nameEN'];
}
export function getLocalisedTime(time) {
    if (optionsStored['timeFormat'] === '24hour')
        return (time < 10 ? "0" : "")+time+":00";
    if (time>=12)
        return (time % 12 ? time%12 : 12)+" PM";
    else
        return (time % 12 ? time%12 : 12)+" AM";
}
export function getLocalisedDate({year : year, month : month, day : day}) {
    if (optionsStored['dates'] === 'dmy')
        return `${day}.${month}.${year}`;
    else
        return `${month}/${day}/${year}`;
}
export function getLocalisedTemperature(temperature) {
    if (optionsStored['temperature'] === 'fahrenheit')
        return Math.round(1.8 * temperature + 32) + '°F';
    return Math.round(temperature) + '°C';
}
export function getLocalisedPressure(pressure) {
    if (optionsStored['pressure'] === 'inhg')
        return (pressure/33.864).toFixed(2) + 'in';
    return Math.round(pressure) + 'hPa';
}