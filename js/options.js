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
//Ako e prv pat otvaranje na browser, generiraj defaulti
if (!optionsStored) {
    optionsStored = await getDefaults();
    localStorage.setItem('options',JSON.stringify(optionsStored));
}
//Se chekiraat site inputi ciisto opcii se izbrani
for (const x in optionsStored)
    document.getElementById(optionsStored[x]).checked = true;


async function getDefaults() {
    const {countryCode : cc} = await locate.remote(); //Zemanje country code od ip lokacija
    return {
        dates : ['US','PH','MY','SO','TG','PA','PR','KY','GL'].includes(cc) ? 'mdy' : 'dmy',
        distance : ['LR','MM','UK','US'].includes(cc) ? 'imperial' : 'metric',
        language : 'MK' === cc ? 'macedonian' : 'english',
        pressure : 'US' === cc ? 'inhg' : 'hpa',
        temperature : ['US','BS','KY','LR','PW','FM','MH'].includes(cc) ? 'fahrenheit' : 'celsius',
        timeFormat : ['AU','BD','CA','CO','EG','SV','HN','IN','IE','JO','MY','MX','NZ','NI','PK','PH','SA','US'].includes(cc) ? '12hour' : '24hour'
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