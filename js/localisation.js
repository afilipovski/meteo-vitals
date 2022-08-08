const en = {
    'search-input':'Search...',
    'sync':'Sync',
    'language-and-time':'Language & Time',
    'language':'Language',
    'time-format':'Time format',
    '24hour':'24-hour',
    '12hour':'12-hour',
    'dates':'Dates',
    'measurements':'Measurements',
    'temperature':'Temperature',
    'pressure':'Pressure',
    'view':'View',
    'feels-like':'Feels like',
    //TO-DO: opisi za vremeto
    'humidity':'Humidity',
    //TO-DO: opisi za zagaduvanje
    'error':'Error',
    'no-results':'No results were found for '
}
const mk = {
    'search-input':'Пребарај...',
    'sync':'Синхронизација',
    'language-and-time':'Јазик и време',
    'language':'Јазик',
    'time-format':'Формат на време',
    '24hour':'24-часовен',
    '12hour':'12-часовен',
    'dates':'Датуми',
    'measurements':'Мерки',
    'temperature':'Температура',
    'pressure':'Притисок',
    'view':'Преглед',
    'feels-like':'Се чувствува како',
    //TO-DO: opisi za vremeto
    'humidity':'Влажност',
    //TO-DO: opisi za zagaduvanje
    'error':'Грешка',
    'no-results':'Не беа пронајдени резултати за '
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