import {URLRequest} from './api_utils.js'

//window.locate = {remote, browser}; //locate.remote() dava ip-lokacija, locate.browser() dava gps-lokacija

export async function remote() {
    //"Keshirana" ip-lokacija, za da se izbegnat nepotrebni povici kon API-to
    let locationStored = JSON.parse(sessionStorage.getItem('iplocation'));
    if (locationStored)
        return locationStored;
    try {
        //Povik kon API, f-jata vrakja samo geog. shirina, dolzina i kod za drzava
        let result = await URLRequest('https://api.ipgeolocation.io/ipgeo?apiKey=060c7f9fd3b54445ab371a151132a07b');
        locationStored = {
                latitude : result.latitude,
                longitude : result.longitude,
                countryCode : result['country_code2']
        }
        //Rezultatot se keshira
        sessionStorage.setItem('iplocation',JSON.stringify(locationStored));
        return locationStored;
    }
    catch(err) {
        console.log(err);
    }
}
export async function browser() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    latitude : position.coords.latitude,
                    longitude : position.coords.longitude
                });
            }, () => { //Dokolku korisnikot zabrani pristap do lokacija, se zema lokacijata na negovoto IP
                remote().then(iplocation => {
                    resolve(iplocation);
                })
            })
        }
        else {
            remote().then(iplocation => { //Dokolku browserot na korisnikot nema sposobnosti za geolokacija, se zema IP-lok.
                resolve(iplocation);
            })
        }
    })
}