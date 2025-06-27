# 🏢 Work Pod Varausjärjestelmä API v1

Moderni ja tehokas API Work Pod -varausjärjestelmälle, joka hyödyntää Google Calendar -integraatiota saumattomaan varausten hallintaan.

---

## 🚀 Ominaisuudet

- **Google Calendar -integraatio** - Automaattinen synkronointi Google-kalenterin kanssa
- **Reaaliaikainen varausten hallinta** - Välitön päivitys varausten tilasta
- **RESTful API** - Selkeä ja intuitiivinen API-rajapinta
- **Turvallinen autentikointi** - JWT-pohjainen käyttäjien tunnistus
- **Tietokantaintegraatio** - SQLite-tietokanta kehitykseen, skaalautuva tuotantoon

---

## 📋 Vaatimukset

- Node.js (versio 22 tai uudempi)
- npm
- Google Cloud Platform -tili (Calendar API:n käyttöön)

---

## ⚡ Pika-asennus

### 1. Riippuvuuksien asennus

```bash
npm install
```

### 2. Admin-panelin asennus

Paneeli tulee buildata ja se löytyy senjälkeen expressistä osoitteesta

`localhost:3000/admin`

```bash
npm run install:admin
npm run build:admin
```

### 3. Ympäristömuuttujien määrittely

Luo `.env` -tiedosto projektin juureen:

```bash
# Google Calendar API
GOOGLE_CLIENT_ID=LAITA_TÄHÄN_OMA
GOOGLE_CLIENT_SECRET=LAITA_TÄHÄN_OMA
CALLBACK_URL=http://localhost:3000/auth/google/callback

# Sessio ja JWT
SESSION_SECRET=salainen_arvo
JWT_SECRET=salainen_jwt_arvo

# Tietokanta
DATABASE=./usage.sqlite
```

Luo admin-panelin `.env` -tiedosto:

```bash
# Admin-panelin konfiguraatio  
VITE_API_URL="http://localhost:3000/api/v1"
VITE_GOOGLE_CLIENT_ID=LAITA_TÄHÄN_OMA (Saa olla sama kuin ylemmässä .env)
```

### 4. Tietokannan alustus

Ennen ensimmäistä käynnistystä aja:

```bash
npm run init-db
npm run seed:calendars
```

Tämä luo SQLite-tietokannan projektin juureen.
Seed:calendars vie olemassa olevat 5 kalenterin osoitetta tietokantaan.

---

## 🔧 Kehitysympäristön käynnistys

### Backend-palvelin

```bash
# Kehitystilassa
npm run dev

# Tuotantotilassa PM2:lla
pm2 start npm --name "bakkari-dev" -- run dev

# Tarkista logit
pm2 log

# Testaa analytiikka
npm run show-db
```

Palvelin käynnistyy osoitteeseen `http://localhost:3000`

### Admin-paneeli

Jos backend pyörii lokaalisti, buildaa ensin admin-paneeli:

```bash
npm run build:admin
```

Admin-paneeli on käytettävissä osoitteessa `http://localhost:3000/admin`

**Kirjautuminen:** Google-tunnuksilla (LAB/LUT). Vain hyväksytyt käyttäjät voivat kirjautua.

Tietokannan ollessa tyhjä, ensimmäinen kirjautuminen lisätään tietokantaan `admin` käyttäjänä.

---

## 🗓️ Kalenteri ID:t

Kalenteri ID:nä toimii podien nimet. Endpoint `/calendars` palauttaa nykyiset käytössä olevat kalenterit.

Kalenterit saattavat muuttua, eikä tätä listaa ylläpidetä.

**Nykyiset kalenterit:**
- C238-1
- C238-2  
- C238-3
- C203-1
- C203-2

---

## 📚 API-dokumentaatio

API kuuntelee oletuksena osoitteessa `http://localhost:3000/api/v1`


### `Kaikki apin palautukset on kääritty nyt succesWrapperin ympärille!!`

Palautusten vastaus pysyy samana, mutta se on nyt data kentässä:

```json
{
  "success": true,
  "data": [
    {
    // jonkun endpoitin palautus tähän. esim events alla
    "id": "iqf1ltk7072iabi2j0tg9me9q8",
    "title": "Matti Meikäläinen",
    "start": "2025-06-26T13:00:00+03:00",
    "end": "2025-06-26T14:00:00+03:00",
    }
  ],
  //90% palautuksista ei käytä messagea.
  "message": "Tämä on harvoin käytössä, mutta joskus käytetään."
}
```

### 🎯 Varausten hallinta

#### POST `/book`

Luo varaus valittuun kalenteriin. Tarkistaa ettei kalenterissa ole jo varausta.

**Pyyntö:**
```json
{
  "calendarId": "C238-1",
  "start": "2025-05-25T09:00:00+03:00",
  "end": "2025-05-25T10:00:00+03:00"
}
```

**Vastaus:**
```json
{
  "success": true,
  "data": "https://calendar.google.com/event?eid=..."
}
```

#### GET `/events`

Hakee kalenterin tapahtumat annetulta aikaväliltä FullCalendar.js -formaatissa.

**Parametrit:**
```
/events?calendarId=C238-1&timeMin=2025-05-15T00:00:00Z&timeMax=2025-05-22T00:00:00Z
```

**Vastaus:**
```json
[
  {
    "id": "iqf1ltk7072iabi2j0tg9me9q8",
    "title": "Matti Meikäläinen",
    "start": "2025-06-26T13:00:00+03:00",
    "end": "2025-06-26T14:00:00+03:00",
  }
]
```

#### GET `/calendars`

Palauttaa kaikki kalenterit ja niiden statuksen.

**Vastaus:**
```json
{
  "calendars": [
    { "alias": "C238-1", "status": "free" },
    { "alias": "C238-2", "status": "busy" },
    { "alias": "C238-3", "status": "unknown" }
  ]
}
```

#### GET `/user-events`

Palauttaa kirjautuneen käyttäjän varaukset seuraavan 30 päivän ajalta.

**Autentikointi:** Vaatii sisäänkirjautumisen

**Vastaus:**
```json
[
  {
    "id": "iqf1ltk7072iabi2j0tg9me9q8",
    "calendarId": "C238-1",
    "title": "Matti Meikäläinen",
    "start": "2025-06-26T13:00:00+03:00",
    "end": "2025-06-26T14:00:00+03:00",
  }
]
```

#### DELETE `/cancel/:calendarId/:eventId`

Peruuttaa käyttäjän varauksen. Jos `eventId` jätetään pois, poistaa kaikki käyttäjän varaukset.

**Esimerkki:**
```
DELETE /cancel/C238-1/2ifn2fif
```

**Vastaus:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

#### GET `/booking/:calendarId/:eventId`

Hakee yksittäisen varauksen tiedot.

**Vastaus:**
```json
{
  "name": "Maija Meikäläinen",
  "calendarId": "C238-1",
  "date": "2025-05-24",
  "start": "09:00",
  "end": "10:00"
}
```

### 📱 Tablet-endpointit

#### POST `/tablet-book`

Tablet-käyttöliittymälle oma varausendpoint.

**Pyyntö:**
```json
{
  "calendarId": "C238-1",
  "start": "2025-06-26T13:00:00+03:00",
  "end": "2025-06-26T14:00:00+03:00",
  "name": "Maija Meikäläinen"
}
```

**Vastaus:**
```json
{
  "success": true,
  "data": "https://www.google.com/calendar/event?eid=..."
}
```

### 🔐 Autentikointi

#### POST `/auth/login`

Ottaa vastaan Google ID tokenin ja palauttaa JWT:n.

**Pyyntö:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Vastaus:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userEmail": "user@mail.com"
}
```

### 👥 Käyttäjähallinta

#### POST `/user/verify`

Tarkistaa käyttäjän oikeudet admin-paneeliin.

**Pyyntö:**
```json
{
  "email": "joel@example.com"
}
```

**Vastaus:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "name": "Joel Ryynänen",
    "email": "joel@example.com",
    "role": "admin"
  }
}
```

#### GET `/users/get`

Palauttaa kaikki käyttäjät tietokannasta.

**Vastaus:**
```json
[
  {
    "id": "23dsdfsdf",
    "name": "Joel Ryynänen",
    "email": "joel@example.com",
    "role": "admin"
  },
  {
    "id": "ssgegg3g3s",
    "name": "Maija Meikäläinen",
    "email": "maija@example.com",
    "role": "user"
  }
]
```

#### POST `/users/add`

Lisää käyttäjän admin-tietokantaan.

**Pyyntö:**
```json
{
  "name": "Uusi Käyttäjä",
  "email": "uusi@example.com",
  "role": "user"
}
```

**Vastaus:**
```json
{
  "id": "string",
  "name": "Uusi Käyttäjä",
  "email": "uusi@example.com",
  "role": "user"
}
```

#### PUT `/users/edit/:id`

Päivittää olemassa olevan käyttäjän tiedot.

**Pyyntö:**
```json
{
  "name": "Päivitetty Käyttäjä",
  "email": "paivitetty@example.com",
  "role": "admin"
}
```

**Vastaus:**
```json
{
  "id": "string",
  "name": "Päivitetty Käyttäjä",
  "email": "paivitetty@example.com",
  "role": "admin"
}
```

#### DELETE `/users/delete/:id`

Poistaa käyttäjän ID:n perusteella.

### 📅 Kalenterihallinta

#### GET `/calendars/admin`

Palauttaa kalenterit hallintanäkymää varten.

**Vastaus:**
```json
{
  "calendars": [
    {
      "alias": "C238-1",
      "isActive": false,
      "color": "blue"
    }
  ]
}
```

#### POST `/createCalendar`

Luo uuden kalenterin Google Calendar API:n kautta ja tallentaa sen tiedot tietokantaan.

**Pyyntö:**
```json
{
  "alias": "C238-1",
  "color": "red"
}
```

**Vastaus:**
```json
{
  "alias": "C238-1",
  "calendarId": "a1b2c3d4e5@group.calendar.google.com",
  "isActive": false,
  "color": "red"
}
```

🔒 **Huom:** Kalenteri lisätään tilassa `isActive: false`. Aktivointi tehdään erikseen.

#### POST `/editCalendar/:id`

Päivittää kalenterin aliaksen ja värin.

**Esimerkki:**
```http
POST /api/v1/editCalendar/C238-1
```

**Pyyntö:**
```json
{
  "alias": "C238-3",
  "color": "teal"
}
```

**Vastaus:**
```json
{
  "message": "Calendar updated successfully"
}
```

#### DELETE `/deleteCalendar/:alias`

Poistaa kalenterin annetulla alias-tunnisteella.

**Vastaus:**
```json
{
  "message": "Calendar 'C238-1' deleted successfully"
}
```

#### PATCH `/toggleActive/:alias`

Päivittää kalenterin aktiivisuustilan (true = näkyvissä ja varattavissa, false = piilotettu).

**Esimerkki:**
```http
PATCH /api/v1/toggleActive/C238-1
```

**Pyyntö:**
```json
{
  "isActive": false
}
```

**Vastaus:**
```json
{
  "message": "Calendar 'C238-1' active status set to false"
}
```

### 📱 Tablettihallinta

#### GET `/tablets/get`

Hakee kaikki tabletit.

**Vastaus:**
```json
[
  {
    "id": "string",
    "name": "Dev-Lenovo",
    "location": "testaaja-kekw",
    "calendarId": "C203-1",
    "ipAddress": "172.25.160.28",
    "color": "pink"
  }
]
```

#### POST `/tablets/add`

Luo uuden tabletin.

**Pyyntö:**
```json
{
  "name": "C203-1",
  "location": "C203",
  "calendarId": "C203-1",
  "ipAddress": "192.168.1.42",
  "color": "green"
}
```

#### PUT `/tablets/edit/:id`

Päivittää tabletin tiedot.

**Esimerkki:**
```http
PUT /api/v1/tablets/edit/d460fe8c-...
```

**Pyyntö:**
```json
{
  "name": "C208-1 kopin Tabletti",
  "location": "Toinen paikka",
  "calendarId": "C208-1",
  "ipAddress": "192.168.1.44",
  "color": "blue"
}
```

**Vastaus:**
```json
{
  "id": "string",
  "name": "C208-1 kopin Tabletti",
  "location": "Toinen paikka",
  "calendarId": "C208-1",
  "ipAddress": "192.168.1.44",
  "color": "blue"
}
```

#### DELETE `/tablets/delete/:id`

Poistaa tabletin.

**Vastaukset:**
- `204 No Content` - jos poisto onnistui
- `404 Not Found` - jos tabletia ei löytynyt

### 📊 Analytiikka

#### GET `/analytics-hour`

Varausmäärät tuntikohtaisesti.

**Vastaus:**
```json
[
  { "hour": "09", "count": 4 },
  { "hour": "10", "count": 8 }
]
```

#### GET `/analytics-week`

Varausmäärät viikonpäivittäin (0 = sunnuntai, 6 = lauantai).

**Vastaus:**
```json
[
  { "weekday": "1", "count": 10 },
  { "weekday": "2", "count": 15 },
  { "weekday": "3", "count": 8 }
]
```

#### GET `/analytics-yearly`

Kaikkien varausten määrä kuukausittain jaoteltuna.

**Vastaus:**
```json
{
  "labels": [
    "Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä",
    "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"
  ],
  "data": [4, 9, 7, 15, 22, 10, 8, 3, 0, 0, 0, 0]
}
```

#### GET `/analytics-events`

Varausten ja peruutusten määrät.

**Vastaus:**
```json
[
  { "action": "created", "count": 120 },
  { "action": "deleted", "count": 15 }
]
```

#### GET `/analytics-drilldown`

Varausmäärät kalentereittain suodatettuna.

**Parametrit:**
- `type`: hour | weekday | month
- `value`: 13 | 2 | 2025-6 | Kesä

**Esimerkkejä:**
```
GET /api/v1/analytics-drilldown?type=hour&value=13
→ Kaikki klo 13 tehdyt varaukset kalentereittain

GET /api/v1/analytics-drilldown?type=weekday&value=2  
→ Kaikki tiistain varaukset

GET /api/v1/analytics-drilldown?type=month&value=2025-06
→ Kesäkuun 2025 varaukset

GET /api/v1/analytics-drilldown?type=month&value=Kesä
→ Kaikki kesäkuun varaukset (vuodesta riippumatta)
```

#### GET `/analytics-drilldown-all`

Kaikki varaukset kalentereittain ilman suodatusta.

**Vastaus:**
```json
[
  {
    "calendar_id": "C238-1",
    "calendar_name": "C238-1", 
    "count": 142
  },
  {
    "calendar_id": "C238-2",
    "calendar_name": "C238-2",
    "count": 98
  }
]
```

---

## 🏗️ Projektin rakenne

```
work-pod-api/
├── src/
│   ├── cache/     
│   ├── config/ 
│   ├── entities/
│   ├── middleware/
│   ├── routes/
│   │   └── v1/
│   ├── scripts/      
│   ├── services/      
│   ├── types/
│   └── utils/           
│
└── admin-panel/       
    └── src/  
        ├── assets/
        ├── components/
        │   ├── auth/
        │   ├── navigation/
        │   ├── pages/
        │   └── ui/
        ├── hooks/
        ├── types/
        └── utils/
```

---

## 🔐 Google Calendar -integraatio

### 1. Google Cloud Console -asetukset

1. Siirry [Google Cloud Console](https://console.cloud.google.com/)
2. Luo uusi projekti tai valitse olemassa oleva
3. Ota käyttöön Calendar API
4. Luo OAuth 2.0 -tunnistetiedot
5. Lisää `http://localhost:3000/auth/google/callback` sallittuihin callback-URL:eihin

### 2. API-avainten konfigurointi

Kopioi Client ID ja Client Secret `.env` -tiedostoon:

```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## 🧪 Testaus

```bash
# Suorita kaikki testit
npm test

# Suorita testit watch-tilassa
npm run test:watch

# Generoi testikattavuusraportti
npm run test:coverage
```

---

## 🚀 Tuotantoon vienti

### 1. Rakenna sovellus

```bash
npm run build
```

### 2. Käynnistä tuotantotilassa

```bash
npm start
```

### 3. Ympäristömuuttujat tuotannossa

Varmista, että seuraavat ympäristömuuttujat on määritetty:

- `NODE_ENV=production`
- `DATABASE_URL` (tuotantotietokanta)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `SESSION_SECRET`

---

## 🤝 Kehittäminen

### Koodin tyyli

Projekti käyttää ESLint:iä ja Prettier:iä koodin laadun varmistamiseen:

```bash
# Tarkista koodin tyyli
npm run lint

# Korjaa automaattisesti korjattavissa olevat ongelmat
npm run lint:fix

# Formatoi koodi
npm run format
```
