# Work Pod Varausjärjestelmän API v1

Tämä API tarjoaa pääsyn työskentelykopin Google-kalentereihin varauksia varten.

Käynnistä komennolla `pm2 start npm --name "bakkari-dev" -- run dev`

Logi löytyy komennolla `pm2 log`

## Kalenteri ID

Kalenteri id:nä toimii tällähetkellä podien nimet.
Toistaiseksi käytössä on vain kalenterit work podeille.
* C238-1
* C238-2
* C238-3
* C203-1
* C203-2

## Endpoints

Api kuuntelee osoitteessa `http://localhost:3000/api/v1`

---

### 1. POST `/book`

Luo varaus valittuun kalenteriin.

**Pyyntö (JSON body):**

```json
{
  "calendarId": "C228-1",
  "start": "2025-05-25T09:00:00+03:00",
  "end": "2025-05-25T10:00:00+03:00"
}
```
* calendarId: Lyhyt alias kalenterille.
* start: Varaus alkaa ISO 8601 -aikamuodossa.
* end: Varaus päättyy ISO 8601 -aikamuodossa.

**Vastaus**

```json
{
  "success": true,
  "link": "https://calendar.google.com/event?eid=..."
}
```
---

### 2. POST `/events`

Hakee yksittäisen kalenterin tapahtumat annetulta aikaväliltä. Palauttaa tiedot FullCalendar.js -formaatissa.

**Pyyntö (query-parametrit)**

```
/events?calendarId=C220-1&timeMin=2025-05-15T00:00:00Z&timeMax=2025-05-22T00:00:00Z
```

* calendarId: Kalenterin alias esim C238-1
* timeMin: Haun alkuaika ISO 8601 -muodossa.
* timeMax: Haun loppuaika ISO 8601 -muodossa.

**Vastaus**

FullCalendar.js -muotoinen JSON-array tapahtumista.

esim:

```json
[
    {
        "id": "84ojdg6vpqp8ga0vhs6kkprq9k",
        "title": "Joel Ryynänen",
        "start": "2025-05-19T12:15:00+03:00",
        "end": "2025-05-19T13:15:00+03:00",
        "allDay": false,
        "url": "https://www.google.com/calendar/event?someurl"
    },
    {
        "id": "qk5iht3g5fdu65r5snlt9p97ec",
        "title": "Varattu",
        "start": "2025-05-21T05:00:00+03:00",
        "end": "2025-05-21T06:00:00+03:00",
        "allDay": false,
        "url": "https://www.google.com/calendar/event?someurl"
    },
]
```

---

### 3. POST `/calendars`

Palauttaa kaikki käytettävissä olevat kalenterialias-nimet.

```json
{
  "calendars": ["C238-1", "C220-2", "C220-3", "C203-1", ...]
}
```

---

### 4. GET /user-events

Palauttaa kaikki kirjautuneen käyttäjän tekemät varaukset (kaikista kalentereista) seuraavan 60 päivän ajalta.

Tämä toimii siten, että varauksen `description`-kenttään on aiemmin tallennettu käyttäjän sähköpostiosoite, ja tämä endpoint suodattaa kaikki tapahtumat, joissa `description` sisältää kyseisen sähköpostin.

###  Autentikointi
Vaatii sisäänkirjautumisen. `req.user.email` käytetään tapahtumien suodattamiseen.

###  Parametrit
Ei ota vastaan query-parametreja tai body-dataa.

###  Response (200 OK)

Palauttaa taulukon tapahtumista muodossa:

```json
[
    {
        "id": "2g0b6trhf202uq87pj4r567a80",
        "calendarId": "C238-3",
        "title": "Varattu",
        "start": "2025-05-23T11:00:00+03:00",
        "end": "2025-05-23T12:00:00+03:00",
        "description": "user_email: user@lab.fi"
    },
    ...
]
