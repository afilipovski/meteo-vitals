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
        switch (property) {
            case 'dates':
                if (['US','PH','MY','SO','TG','PA','PR','KY','GL'].includes(cc)) updateSetting('dates','mdy');
                else updateSetting('dates','dmy');
                break;
            case 'distance':
                if (['LR','MM','UK','US'].includes(cc)) updateSetting('distance','imperial');
                else updateSetting('distance','metric');
                break;
            case 'language':
                if ('MK' === cc) updateSetting('language','macedonian')
                else updateSetting('language','english');
                break;
            case 'pressure':
                if ('US' === cc) updateSetting('pressure','inhg')
                else updateSetting('pressure','hpa');
                break;
            case 'temperature':
                if (['US','BS','KY','LR','PW','FM','MH'].includes(cc)) updateSetting('temperature','fahrenheit')
                else updateSetting('temperature','celsius');
                break;
            case 'time-format':
                if (['AU','BD','CA','CO','EG','SV','HN','IN'
                    ,'IE','JO','MY','MX','NZ','NI','PK','PH','SA','US'].includes(cc)) updateSetting('time-format','12hour')
                else updateSetting('time-format','24hour');
                break;
        }
    }
    //Chekiranje na inputi, vneseno tuka bidejki funkcijata e asinhrona i vaka se garantira redosledot na izvrsuvanje
    for (const x in optionsStored)
        document.getElementById(optionsStored[x]).checked = true;
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