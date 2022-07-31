window.options = {};
window.optionsStored = JSON.parse(localStorage.getItem('options'));

//Ako e prv pat otvaranje na browser, generiraj defaulti
if (!optionsStored) {
    optionsStored = await getDefaults();
    localStorage.setItem('options',JSON.stringify(optionsStored));
}

export async function getDefaults() {
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