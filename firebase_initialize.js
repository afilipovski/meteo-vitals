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
    checkActive();
  }
}

function checkActive() {
  for(let x in options) {
    for(let y of options[x])
      document.getElementById(y).checked = (optionsStored[x] === y);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    const optionsRef = ref(db,`users/${user.uid}/options`);
    onValue(optionsRef, (snapshot) => {
      if(snapshot.exists()) { 
        optionsStored = snapshot.val();
        checkActive();
      }
      else { //ako nema vlez vo db za korisnikot
        set(optionsRef,optionsStored);
      }
    })
    
  }
  else {
    optionsStored = JSON.parse(localStorage.getItem('options'));
    checkActive();
  }
})