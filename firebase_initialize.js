// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from "firebase/auth";
import { get, getDatabase, onValue, ref, set } from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHqHLlk6RKV0y8FpUiypmED_Fq9WEcp5E",
  authDomain: "meteo-vitals-a84cc.firebaseapp.com",
  databaseURL: "https://meteo-vitals-a84cc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "meteo-vitals-a84cc",
  storageBucket: "meteo-vitals-a84cc.appspot.com",
  messagingSenderId: "329885935486",
  appId: "1:329885935486:web:c8e4c5e494bb4b1d3ff52f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


//AVTENTIKACIJA


const auth = getAuth();
auth.useDeviceLanguage();

onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('accountinfo').innerHTML = user.displayName + " (" + user.email + ")"; 
    deactivate('buttonDiv'); activate('logoutDiv');
  } else {
    activate('buttonDiv'); deactivate('logoutDiv');
  }
});
document.getElementById('logoutDiv').lastElementChild.onclick = (() => signOut(auth));

function handleCredentialResponse(response) {
  // Build Firebase credential with the Google ID token.
  const idToken = response.credential;
  const credential = GoogleAuthProvider.credential(idToken);

  // Sign in with credential from the Google user.
  signInWithCredential(auth, credential).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    if (debug)
      console.log("Error" + errorCode + ":\n" + errorMessage);
  });
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "329885935486-7dcfusnlfd9hq9q009spfe9jg3b9ts4a.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    document.getElementById("buttonDiv"),
    { 
      type: "standard", 
      size: "medium",
      shape: "rectangular",
      width: "200",
      logo_alignment: "left"
    }  // customization attributes
  );
}


//OPCII


{
  //Zemanje na sekoj fieldset
  let fieldsets = Array.from(document.getElementsByTagName('fieldset'));
  //Za sekoj fieldset, se cita negoviot ID i se dodava kako opcija vo options
  fieldsets.forEach(element => {
      options[element.id] = [];
      //Se dodavaat site inputi koi se del od fieldsetot kako alternativi, im se naznacuva onclick funkcija
      Array.from(element.elements).forEach(alternative => {
          alternative.onclick = function() {
              if (optionsStored[element.id] !== alternative.id)
                updateSetting(element.id,alternative.id);
          };
          options[element.id].push(alternative.id);
      });
  })
}

function updateSetting(setting, choice) {
  if (debug) console.log(`${setting} set to ${choice}`);
  optionsStored[setting] = choice;
  //Ako sme avtenticirani, promenata se zacuvuva vo baza
  if (auth.currentUser)
    set(ref(db,`users/${auth.currentUser.uid}/options/${setting}`), choice);
  //Vo sprotivno se zacuvuva vo lok.mem. - potrebno e da gi chekirame opciite bidejki onValue nema da bide povikana
  else {
    localStorage.setItem('options',JSON.stringify(optionsStored));
    onOptionsStoredChange();
  }
}

import {getDefaults} from "./js/options.js"
window.optionsStored = null;

onAuthStateChanged(auth, (user) => {
  optionsStored = null;
  placesStored = null;
  favoriteContainer.id = '';
  if (user) {
    const optionsRef = ref(db,`users/${user.uid}/options`);
    onValue(optionsRef, (snapshot) => {
      if(snapshot.exists()) { 
        optionsStored = snapshot.val();
        onOptionsStoredChange(); //callback
      }
      else { //ako nema vlez vo db za korisnikot
        set(optionsRef, JSON.parse(localStorage.getItem('options')));
      }
    })
    const placesRef = ref(db,`users/${user.uid}/places`);
    onValue(placesRef, (snapshot) => {
      if(snapshot.exists()) {
        placesStored = snapshot.val();
        renderWeather();
      }
      else {
        set(placesRef,JSON.parse(localStorage.getItem('places')));
      }
    })
  }
  else { 
    optionsStored = JSON.parse(localStorage.getItem('options'));
    if (!optionsStored) {
      getDefaults().then(defaults => {
        optionsStored = defaults;
        localStorage.setItem('options',JSON.stringify(optionsStored));
        onOptionsStoredChange();
      })
    }
    else
      onOptionsStoredChange();
    placesStored = JSON.parse(localStorage.getItem('places'));
    if (!placesStored) {
      generatePlacesEntry().then(entry => {
        placesStored = {
          favId: entry.id,
          statics: {}
        }
        placesStored.statics[entry.id] = {
          nameEN : entry.nameEN,
          nameMK : entry.nameMK
        }
        localStorage.setItem('places',JSON.stringify(placesStored));
        renderWeather();
      })
    }
    else {
      renderWeather();
    }
  }
})

//PO SEKOJA PROMENA NA OPTIONSSTORED, SE POVIKUVA OVAA FUNKCIJA
//Se povikuva samo vo slucai kade korisnikot ne e logiran - bidejki dokolku e, e povikana od onValue
async function onOptionsStoredChange() {
  //Menuvanje na jazik kaj interfejs
  localiseInterface();
  //Chekiranje na aktivni opcii
  for(let x in options) {
    for(let y of options[x])
      document.getElementById(y).checked = (optionsStored[x] === y);
  }
  //Filuvanje na elementite NO NE PRED DA BIDAT ZEMENI STATICITE
  if (placesStored) {
    renderWeather();
  }
}


//VREME


import { browser, remote } from "./js/location.js"
import * as w from "./js/weather.js"

window.placesStored = null;

//INTERFEJS NA PLACESSTORED
function setFav(id) {
  if (placesStored['favId'] !== id) {
    placesStored['favId'] = id;
    if (!auth.currentUser) {
      localStorage.setItem('places',JSON.stringify(placesStored))
      renderWeather();
    }
    else set(ref(db, `users/${auth.currentUser.uid}/places`),placesStored);
  }
}
function pushCard(id) {
  if(!placesStored['statics'].hasOwnProperty(id)) {
    placesStored['statics'][id] = localStaticsCache[id];
  }
  if(!auth.currentUser) {
    renderWeather();
    localStorage.setItem('places',JSON.stringify(placesStored));
  }
  else set(ref(db, `users/${auth.currentUser.uid}/places`),placesStored);
}
function filterCard(id) {
  if (id !== placesStored['favId']) {
    if (placesStored['statics'].hasOwnProperty(id)) {
      delete placesStored['statics'][id];
      document.getElementById(id).remove();
    }
    if(!auth.currentUser) {
      renderWeather();
      localStorage.setItem('places',JSON.stringify(placesStored));
    }
    else set(ref(db, `users/${auth.currentUser.uid}/places`),placesStored);
  }
}

async function renderWeather() {
  if (optionsStored && placesStored) {
    const favContainerId = (favoriteContainer.id !== '') ? favoriteContainer.id : placesStored['favId']; //odnovo renderiranje za ikonite ako veke e inic
    await fillElementId(favoriteContainer, favContainerId);
    //Ciklus niz site elementi vo placesStored, dokolku za nekoj nemame generirano karticka, generirame
    for (const px in placesStored['statics']) {
      if (debug) console.log("push --- FCID: "+favoriteContainer.id+
                  "\nPX: "+px+
                  "\nELEM: "+document.getElementById(px));
      if(px !== favoriteContainer.id && !document.getElementById(px)) {
        const card = w.createCard();
        await fillElementId(card,px);
        document.getElementById('other-pinned').append(card);
      }
    }
    //Ciklus niz site karticki (spread operatorot iskoristen za da imame konzistenten array i pokraj trganje na elem.)
    const cards = [...document.getElementById('other-pinned').children];
    for (const cx of cards) {
      if(!placesStored['statics'].hasOwnProperty(cx.id) || cx.id === favoriteContainer.id) {
        cx.remove();
      }
      else
        fillElementId(cx,cx.id);
    }  
  }

  // googleScriptLoaded.then(initMap);
}

// const newCard = createCard(); newCard.id = 'troll';
// document.getElementById('other-pinned').append(newCard);
// remote().then(location => getAllWeather(location)).then(weas => {
//   fillElement(newCard,weas);
//   fillElement(document.getElementsByClassName('favorite-container')[0],weas);
// })


//favorite-container ne e vo realtime vrzano so placesStored
//other-places e; pri dodavanje na nov grad, se dodava na site instanci koisto gi koristi korisnikot; isto kako i so brisenje

//za inicijalizacija: fav se vcituva vo favorite-container
//na sekoja promena na others, se updateiraat kartickite dolu (funkcija onOthersChange)
//objekt vo koj se cuva mete.info. za sekoe od mestata koe se vcituva - key-value par na id i val

const localWeatherCache = {};
const localStaticsCache = {};


async function getFullWeather(id) {
  if (!localWeatherCache.hasOwnProperty(id) || !localWeatherCache[id].hasOwnProperty('pollution')) {
    const location = w.idToLoc(id);
    const vals = await Promise.all([getWeatherAndForecast(id),w.getPollution(location)]);
    localWeatherCache[id] = {...vals[0], ...vals[1]};
  }
  return localWeatherCache[id];
}

async function getWeatherAndForecast(id) {
  if (!localWeatherCache.hasOwnProperty(id) || !localWeatherCache[id].hasOwnProperty('forecast')) {
    const location = w.idToLoc(id);
    const vals = await Promise.all([getBasicWeather(id), w.getForecast(location)]);
    localWeatherCache[id] = {...vals[0],...vals[1]};
  }
  return localWeatherCache[id];
}

async function getBasicWeather(id) {
  if (!localWeatherCache.hasOwnProperty(id)) {
    const location = w.idToLoc(id);
    const vals = await w.getCurrentWeather(location);
    localWeatherCache[id] = vals;
  }
  return localWeatherCache[id];
}

function getStatics(id) {
  if (placesStored['statics'].hasOwnProperty(id)) return placesStored['statics'][id];
  if (localStaticsCache.hasOwnProperty(id)) return localStaticsCache[id];
}


//Generira statici za mesto. Se koristi samo koga mestoto e dosega nesretnato
async function generatePlacesEntry(query, isLocation = true) {
  if (isLocation) {
    var location = query || await remote();
    var data = await getWeatherAndForecast(w.locToId(location));
  }
  else {
    var location = await w.geolocate(query);
    var data = location;
  }
  const id = w.locToId(location);
  localStaticsCache[id] = {
    nameEN: data.nameEN,
    nameMK: data.nameMK
  }
  return {
    id: w.locToId(location),
    ...localStaticsCache[id]
  }
}

const favoriteContainer = document.getElementsByClassName('favorite-container')[0];
import {openModal, closeModal} from "./js/modal.js";
import { getLocalisedText, localiseInterface, getLocalisedPlaceName } from "./js/localisation.js";

//Locate kopce
document.getElementById('locate').onclick = (() => {
  browser().then(location => {
    generatePlacesEntry(location).then(entry => {
      favoriteContainer.id = entry.id;
      renderWeather();
    });
  })
})
//Search kopce
document.getElementById('search').onclick = (() => {
  const query = document.getElementById('search-input').value;
  generatePlacesEntry(query, false).then(entry => {
    fillElementId(favoriteContainer, entry.id).then(renderWeather);
  }).catch(err => {
    openModal(getLocalisedText('error'),getLocalisedText('no-results')+query);
  });
})
//Home kopce
document.getElementById('home').onclick = (() => {
  if (debug) console.log("HOME");
  fillElementId(favoriteContainer, placesStored['favId']).then(renderWeather);
})
//Add kopce
document.getElementById('add').onclick = (() => {
  if (debug) console.log("ADD");
  pushCard(favoriteContainer.id);
})
document.getElementById('star').onclick = (() => {
  if (debug) console.log("STAR");
  setFav(favoriteContainer.id);
})

//Za da se keshiraat staticite na nekoe mesto mora
//1: da e importirano od db/placesStored
//  placesStored
//    favId
//    statici (na update na placesStored se azurira)
//    ^ da bide key-value par za da moze da se bara od nego
//2: da e dodadeno so locate
//3: da e dodadeno so prebaruvanje

async function fillElementId(element, id, mapInfowindow = false) {
  const weather = (element === favoriteContainer ? await getFullWeather(id) : await getBasicWeather(id)); //SAMO MOMENTALNO
  w.fillElement(element, id, getStatics(id), weather);
  if (!mapInfowindow) {
    if (element.classList.contains('card')) {
      element.querySelector('.close').onclick = (event => {
        event.stopPropagation();
        filterCard(id);
      })
      element.onclick = (() => {
        favoriteContainer.id = element.id;
        renderWeather();
      })
    }
  }
}

//KARTA

// let infowindow;
// function fillInfoWindow(id) {
//   const weatherInfowindow = w.createCard();
//   fillElementId(weatherInfowindow,id,true);
//   infowindow = new google.maps.InfoWindow({
//     content: weatherInfowindow,
//     minWidth: 250
//   })
// }

// function createMarker(id) {
//   const icon = {
//     url: (id === placesStored['favId']) ? 'images/pin_yellow.png' : 
//     ((!placesStored['statics'].hasOwnProperty(id)) ? 'images/placeholder.png' : 'images/pin.png'),
//     scaledSize: new google.maps.Size(35,35)
//   }
//   const marker = new google.maps.Marker({
//       position: idToGLoc(id),
//       title: getLocalisedPlaceName(getStatics(id)),
//       icon: icon
//   })
//   marker.addListener("click", () => {
//     if (infowindow)
//       infowindow.close();
//     fillInfoWindow(id);
//     infowindow.open({
//       anchor: marker,
//       map,
//       shouldFocus: false,
//     });
//   });
//   marker.setMap(mapObj);
//   return {
//     marker: marker,
//     infowindow: infowindow
//   }
// }

// let markers = {};
// let centerId;

// function initMap() { googleScriptLoaded.then(() => {
//   for (let mx in markers)
//     markers[mx]['marker'].setMap(null);
//   markers = {};
  
//   if (favoriteContainer.id !== centerId)
//     mapObj.setCenter(idToGLoc(favoriteContainer.id)) //da se polishne

//   for (let px in placesStored['statics']) {
//     markers[px] = createMarker(px);
//   }
//   if (!markers.hasOwnProperty(favoriteContainer.id)) {
//     markers[favoriteContainer.id] = createMarker(favoriteContainer.id);
//   }

//   centerId = favoriteContainer.id;
// })}