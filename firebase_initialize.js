// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from "firebase/auth";
import { get, getDatabase, onValue, ref, set } from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiXPzPqxWk6m7Y6hnAuBBytHv-A-AJCGQ",
  authDomain: "meteo-vitals-a84cc.firebaseapp.com",
  projectId: "meteo-vitals-a84cc",
  storageBucket: "meteo-vitals-a84cc.appspot.com",
  messagingSenderId: "329885935486",
  appId: "1:329885935486:web:c8e4c5e494bb4b1d3ff52f",
  databaseURL: "meteo-vitals-a84cc-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


//AVTENTIKACIJA


const auth = getAuth();
auth.useDeviceLanguage();

onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('logoutDiv').firstElementChild.innerHTML = "Logged in as: " + user.displayName + " (" + user.email + ")"; 
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    const optionsRef = ref(db,`users/${user.uid}/options`);
    onValue(optionsRef, (snapshot) => {
      if(snapshot.exists()) { 
        optionsStored = snapshot.val();
        onOptionsStoredChange(); //callback
      }
      else { //ako nema vlez vo db za korisnikot
        set(optionsRef,optionsStored);
      }
    })
    
  }
  //Tuka e zagarantirano deka ke postoi bidejki vo options.js e opfaten sprotivniot slucaj
  else { 
    optionsStored = JSON.parse(localStorage.getItem('options'));
    onOptionsStoredChange();
  }
})

//PO SEKOJA PROMENA NA OPTIONSSTORED, SE POVIKUVA OVAA FUNKCIJA
//Se povikuva samo vo slucai kade korisnikot ne e logiran - bidejki dokolku e, e povikana od onValue
async function onOptionsStoredChange() {
  //Chekiranje na aktivni opcii
  for(let x in options) {
    for(let y of options[x])
      document.getElementById(y).checked = (optionsStored[x] === y);
  }
  //Filuvanje na elementite NO NE PRED DA BIDAT ZEMENI STATICITE
  if (placesStored) {
    let weather = await getFullWeather(favoriteContainer.id);
    w.fillElement(favoriteContainer,favoriteContainer.id,getStatics(favoriteContainer.id),weather);
    const cards = document.getElementById('other-pinned').children;
    for (const cx of cards) {
      weather = await getBasicWeather(cx.id);
      w.fillElement(cx,cx.id,getStatics(cx.id),weather);
    }
  }
}


//VREME


import { browser, remote } from "./js/location.js"
import * as w from "./js/weather.js"

let placesStored;

//INTERFEJS NA PLACESSTORED
function setFav(id) {
  if (placesStored.fav !== id) {
    filterCard(id);
    placesStored.fav = id;
  }
}
function pushCard(id) {
  if(!placesStored.others.includes(id)) {
    placesStored.others.push(id);
  }
}
function filterCard(id) {
  if (placesStored.others.includes(id)) {
    placesStored.others = placesStored.others.filter(x => x !== id);
    document.getElementById(id).remove();
  }
}

//Inicijalizacija
onAuthStateChanged(auth, (user) => {
  if (user) {
    const placesRef = ref(db,`users/${user.uid}/places`);
    
    get(placesRef).then(snapshot => {
      if(snapshot.exists()) {
        placesStored = snapshot.val();
      }
      else {
        set(placesRef,placesStored);
      }
      initialisePlaces();
    });

    onValue(placesRef, (snapshot) => {
      if(snapshot.exists()) {
        placesStored = snapshot.val();
        onPlacesStoredChange();
      }
      else {
        set(placesRef,placesStored);
      }
    })
  }
  else {
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
        initialisePlaces();
      })
    }
    else initialisePlaces();
    onPlacesStoredChange();
  }
})

function onPlacesStoredChange() {
  console.log('placesstored change');
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
    const vals = await Promise.all([getBasicWeather(id),w.getPollution(location)]);
    localWeatherCache[id] = {...vals[0], ...vals[1]};
  }
  return localWeatherCache[id];
}

async function getBasicWeather(id) {
  if (!localWeatherCache.hasOwnProperty(id)) {
    const location = w.idToLoc(id);
    const vals = await Promise.all([w.getCurrentWeather(location), w.getForecast(location)]);
    localWeatherCache[id] = {...vals[0],...vals[1]};
  }
  return localWeatherCache[id];
}

function getStatics(id) {
  if (localStaticsCache.hasOwnProperty(id)) return localStaticsCache[id];
  if (placesStored['statics'].hasOwnProperty(id)) return placesStored['statics'][id];
}


//Generira statici za mesto. Se koristi samo koga mestoto e dosega nesretnato
async function generatePlacesEntry(query, isLocation = true) {
  if (isLocation) {
    var location = query || await remote();
    var data = await getBasicWeather(w.locToId(location));
  }
  else {
    var location = await w.geolocate(query);
    var data = location;
  }
  return {
    id: w.locToId(location),
    nameEN: data.nameEN,
    nameMK: data.nameMK
  }
}


if (debug)
  window.paket = {localStaticsCache, placesStored};

const favoriteContainer = document.getElementsByClassName('favorite-container')[0];

//Locate kopce
document.getElementById('locate').onclick = (() => {
  browser().then(location => {
    generatePlacesEntry(location).then(entry => {
      localStaticsCache[entry.id] = {nameEN: entry.nameEN, nameMK: entry.nameMK};
      getFullWeather(entry.id).then((weather) => {
        w.fillElement(favoriteContainer, entry.id, entry, weather);
      })
    });
  })
})
//Search kopce
document.getElementById('search').onclick = (() => {
  const query = document.getElementById('search-input').value;
  generatePlacesEntry(query, false).then(entry => {
    localStaticsCache[entry.id] = {nameEN: entry.nameEN, nameMK: entry.nameMK};
    getFullWeather(entry.id).then((weather) => {
      w.fillElement(favoriteContainer, entry.id, entry, weather);
    })
  });

})

async function initialisePlaces() {
  const id = placesStored['favId'];
  const favWeather = await getFullWeather(id); 
  w.fillElement(favoriteContainer, id, placesStored['statics'][id], favWeather);
}

//Za da se keshiraat staticite na nekoe mesto mora
//1: da e importirano od db/placesStored
//  placesStored
//    favId
//    statici (na update na placesStored se azurira)
//    ^ da bide key-value par za da moze da se bara od nego
//2: da e dodadeno so locate
//3: da e dodadeno so prebaruvanje