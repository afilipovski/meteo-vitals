/*
ASINHRON WRAPPER ZA XMLHTTPREQUEST, MOZE DA
SE SPECIFICIRA TIP RAZLICEN OD GET, VRAKA
USPEH SAMO AKO STATUSOT NA BARANJETO E 200
Koristenje:
    let x = await URLRequest('text.txt');
    ^ x e rezultatot na baranjeto parsirano vo objekt
Koristenje(2):
    URLRequest('text.txt').then(data => {
        Data ke bide rezultatot na baranjeto
    });
*/

export function URLRequest(url, requestType = 'GET') {

    if (printRequest) console.log(`URL request at ${url}`);

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(requestType,url);
        xhr.onload = () => {
            setTimeout(() => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else
                    reject(JSON.parse(xhr.response));
            }, (simulateDelay ? 500 : 0) );
        };
        xhr.send();
    })
}