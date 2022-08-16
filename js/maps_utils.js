window.googleScriptLoadedResolve = null;
let mapObj;

let googleScriptLoaded = new Promise((resolve, reject) => {
    googleScriptLoadedResolve = () => {
        mapObj = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: {lat: 41, lng: 22},
            mapTypeControlOptions: {
              mapTypeIds: []
            },
            streetViewControl: false
        });
        resolve();
    }
})

function idToGLoc(id) {
    id = id.split('_');
    return {
        lat : parseInt(id[0])/Math.pow(10,decimalPrecision),
        lng : parseInt(id[1])/Math.pow(10,decimalPrecision)
    }
}