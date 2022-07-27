let options = {};
//Citanje opcii od lokalna memorija
let optionsStored = JSON.parse(localStorage.getItem('options'));

//Zemanje na sekoj fieldset
let fieldsets = Array.from(document.getElementsByTagName('fieldset'));
//Za sekoj fieldset, se cita negoviot ID i se dodava kako opcija vo options
fieldsets.forEach(element => {
    options[element.id] = [];
    //Se dodavaat site inputi koi se del od fieldsetot kako alternativi, im se naznacuva onclick funkcija
    Array.from(element.elements).forEach(alternative => {
        alternative.onclick = function() {
            updateSetting(element.id,alternative.id);
        };
        options[element.id].push(alternative.id);
    });
})
if (!optionsStored) {
    setDefaults();
}
else {
    //Se chekiraat site inputi ciisto opcii se izbrani
    for (const x in optionsStored)
        document.getElementById(optionsStored[x]).checked = true;
}

async function setDefaults() {
    optionsStored = {};
    const {countryCode : cc} = await locate.remote(); //Zemanje country code od ip lokacija
    for (const property in options) {
        updateSetting(property,getDefault(property,cc));
    }
    //Chekiranje na inputi, vneseno tuka bidejki funkcijata e asinhrona i vaka se garantira redosledot na izvrsuvanje
    for (const x in optionsStored)
        document.getElementById(optionsStored[x]).checked = true;
}

function getDefault(setting, cc) {
    switch (setting) {
        case 'dates':
            if (['US','PH','MY','SO','TG','PA','PR','KY','GL'].includes(cc)) return 'mdy';
            else return 'dmy';
        case 'distance':
            if (['LR','MM','UK','US'].includes(cc)) return 'imperial';
            else return 'metric';
        case 'language': 
            if ('MK' === cc) return 'macedonian';
            else return 'english';
        case 'pressure':
            if ('US' === cc) return 'inhg';
            else return 'hpa';
        case 'temperature':
            if (['US','BS','KY','LR','PW','FM','MH'].includes(cc)) return 'fahrenheit';
            else return 'celsius';
        case 'time-format':
            if (['AU','BD','CA','CO','EG','SV','HN','IN'
                ,'IE','JO','MY','MX','NZ','NI','PK','PH','SA','US'].includes(cc)) return '12hour';
            else return '24hour';
    }
}
function updateSetting(setting, choice) {

    if (debug) console.log(`${setting} set to ${choice}`);

    optionsStored[setting] = choice;
    options[setting].forEach(x => {
        if (x !== choice)
            document.getElementById(x).checked = false;
    })
    localStorage.setItem('options',JSON.stringify(optionsStored));
}