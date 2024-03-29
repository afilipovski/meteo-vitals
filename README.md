# Meteo Vitals
## Зависни врски
За градење на проектот потребни се NPM (дел од Node.js пакетот), Firebase и Webpack. Во произволен директориум се извршува:

```
git clone https://github.com/afilipovski/meteo-vitals.git
npm install
```

Веб-апликацијата остварува повици кон API за геолокација на корисничка IP адреса, OpenWeatherMap API за метеоролошки податоци, аерозагадување како и за геолокација на имиња на населени места.

## Достапни скрипти
**npm run build** - потребно е да се активира за време на уредување на JS код кој се употребува во firebase_initialise.js - го ажурира firebase_output.js

## Опис на проектот

Meteo Vitals e веб-апликација за временска прогноза изработена како семинарски труд за предметот Основи на Веб Дизајн. Во дизајнот на функционалниот дел од страната има опсежна употреба на асинхрон Javascript код и повици кон надворешни сервиси.

## Елементи од дизајнот на веб-страната

### Локализација
Сајтот е достапен на македонски и англиски јазик. Форматите на време, датум, како и единиците мерки за температура и притисок се достапни во две алтернативни форми со кои се опфаќа најголем дел од стандардните прикази на метеоролошки податоци.

**Генерирањето на номинални вредности** за опциите зависи од локацијата на корисникот. Со помош на повик кон АPI на ipgeolocation.io се пронаоѓа државата на корисникот, и соодветно се сетираат опциите.

Вредностите за опциите иницијално се чуваат во localStorage. Доколку корисникот е автентициран со Google, почнува да се води сметка за неговите податоци. Во базата на податоци се креира ставка со неговиот ID, со која може да манипулира само тој корисник.

Во js/localisation.js се наоѓаат функциите за земање на локализирани имиња, стрингови, време, датум и единици мерки. Сите стрингови кои се појавуваат во веб-страната се преведени и на македонски јазик.

### Временска прогноза

Корисникот може да добие метеоролошки податоци за својата локација со притискање на копчето за лоцирање лево од полето за пребарување. Се користат сервисите за локација на веб-прелистувачот, но доколку корисникот не даде пристап до својата локација, се користи локацијата од IP-адресата.

Исто така може да се пребаруваат места по име, за што се користи API за геолокација на OpenWeatherMap.

При пребарување на населени места, отпрвин се прикажуваат во favoriteContainer-от, а потоа корисникот има можност со притискање на плусот да ги зачува.

Од зачуваните места, едно се издвојува како омилена локација. Тоа населено место на карта е обележано различно од другите и се вчитува при вклучување на страницата.

Слично како опциите, зачуваните места и омилената локација се чуваат во локална меморија се' додека корисникот не се автентицира, при што се синхронизираат со Realtime Database функционалноста на Firebase.

### Позадинска боја

За најголем дел од населените места се води евиденција за тоа во колку часот Сонцето изгрева и заоѓа, како и за облачноста (0-100%). Овие податоци се искористени за да се создаде динамична позадина соодветна на временските услови.

Започнуваме со базната боја позната во CSS како lightskyblue (R: 135, G: 206, B: 250). Потоа на неа ги применуваме двете трансформации од js/color_transformations.js, имено:

>I. Greyify
>
>Функција која прима 2 параметри - основната боја и фактор (0<f<0.7)
>
>Резултантната боја е следната:
>
>$R' = R+f(A-R)$
>
>$G' = G+f(A-G)$
>
>$B' = G+f(A-B)$
>
>Каде $A = \frac{R+G+B}{3}$, аритметичка средина од трите компоненти на основната боја. Практично кажано, функцијата ги „приближува“ трите компоненти на бојата кон нивната аритметичка средина со цел да се добие одредена нијанса на сивило.
>
>Факторот $f$ е определен од процентот на облачност добиен од API, скалиран на $[0,0.7]$ интервалот.

>II. Darken
>
>Функција која прима 2 параметри - основната боја и фактор (0<f<0.6)
>
>Резултантната боја е следната:
>
>$R' = (1-f)R$
>
>$G' = (1-f)G$
>
>$B' = (1-f)B$
>
>Функцијата ги „приближува“ трите компоненти на бојата кон 0, со цел да ја затемни позадината. Факторот 
>
>Факторот $f$ е опредлен од апсолутната вредност на аголот $\alpha$ (дискутиран подолу), поделен со 180, скалиран на интервалот $[0,0.6]$

Доколку во населеното место во главниот приказ не е ноќ, позадината на веб-страната ќе биде линеарен градиент помеѓу резултантната боја и транспарентно. Аголот на транспарентниот крај се определува со следната формула:

$\alpha = \frac{x-a}{b-a} \cdot 270\degree$,

каде $x$ е моменталното време, $a$ е времето на изгрејсонце, и $b$ е времето на зајдисонце, сите изразени во UNIX секунди.

### Штедење на API повици

Поради ограниченоста на API повиците беше битно веб-апликацијата да се дизајнира на начин што најекономично ги користи. На пример, податоците добиени од ipgeolocation.io се зачувуваат во меморија до крајот на сесијата (гасење на таб/прелистувач), и кога ќе бидат повторно потребни, од таму се вчитуваат. На сличен начин е остварено повикувањето на OpenWeatherMap APIто - временските податоци се „кешираат“ за следна употреба, но за разлика од IP локацијата, не се чуваат при refresh на страницата.

## Проблеми при изработување на проектот

1. API-то на OpenWeatherMap понекогаш не функционира (враќа празен објект како одговор, не враќа дел од податоците, итн). Исклучоците во повиците за аерозагадување се ноторни и најлесни за решавање, па веб-сајтот е дизајниран да може да се справи со нив.
2. Откривање на API клучеви во строго front-end страница. Бидејќи проектот е хостиран на GitHub Pages, немаше бесплатен начин да се апстрахираат повиците кон сервисите кои се користат. За среќа, Google Cloud сервисите дозволуваат ограничување на API клучевите на одредени повикувачи, со што се заштитуваат од злоупотреба најбитните клучеви.
