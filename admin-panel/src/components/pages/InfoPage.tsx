import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Card } from "../ui/Card";
import { BarChart3, CalendarCheck, Tablet, UsersIcon, Info } from "lucide-react";

export const InfoPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openImage = (src: string) => {
    setActiveImage(src);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Tietoja järjestelmästä
      </h1>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Yleistä</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            Tämä järjestelmä on toteutettu LAB/LUT-ammattikorkeakoulun
            opettajien käyttöön itsenäisten työskentelykoppejen varaamista
            varten. Varauksen voi tehdä mistä tahansa nettisivumme kautta tai
            paikan päällä koppien edestä tableteilla.
          </p>
          <p>
            Varaustiedot tallennetaan Google-kalentereihin. Backend-palvelin
            hoitaa kaiken kommunikoinnin Googlen rajapinnan kanssa.
          </p>
          <p>
            Sovellus on toteutettu käyttäen Node.js-, TypeScript-, React-,
            SQLite-, Express- ja TypeORM-teknologioita.
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">
          Admin-paneelin käyttöohje
        </h3>

        <div className="space-y-6 text-sm text-gray-700">
          <div>
            <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-1 space-y-8">
              <BarChart3 className="h-5 w-5 text-gray-500"></BarChart3>
              Data-analytiikka
            </h4>
            <p className=" mt-4">
              Katsele varausmääriä, käyttöastetta ja muuta tilastotietoa eri
              ajanjaksoilta.
            </p>
            <p>
              Voit klikata mitä tahansa pylvästä nähdäksesi kalenterikohtaisen
              näkymän kyseiseltä ajankohdalta.
            </p>
            <p>
              Kalenterien värit määräytyvät <strong>Kalenterit</strong>
              -välilehdellä asetettujen värien mukaan.
            </p>
          </div>

          <img
            src="/admin/kuvat/calendaranalytics.png"
            alt="Analytiikka näkymä"
            className="max-w-40 rounded-md cursor-pointer hover:opacity-80 transition"
            onClick={() => openImage("/admin/kuvat/calendaranalytics.png")}
          />

          <div>
            <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-1 space-y-8">
              <CalendarCheck className="h-5 w-5 text-gray-500" /> Kalenterien
              hallinta
            </h4>
            <p className=" mt-4">
              Lisää, muokkaa tai poista kalentereita, jotka vastaavat
              työskentelykoppeja. Jokaisella kopilla on oma Google-kalenteri.
            </p>
            <p>
              Kalenteria lisättäessä taustajärjestelmä luo kalenterin Googlen
              puolelle ja linkittää sen osoitteen käyttäjän antamaan nimeen
              (alias).
            </p>
            <p>
              Kalenterin nimi (alias) tulisi olla kuvaava, esim.{" "}
              <strong>C238-2</strong> tarkoittaa huoneen C238 toista
              työskentelykoppia. Varaussivulla kalenterit ryhmitellään nimen
              alkuosan mukaan (esim. C238, C203 jne.).
            </p>
            <p>
              Kalenterin voi aktivoida tai deaktivoida oikealla olevasta
              painikkeesta <strong>Aktiivinen / Ei aktiivinen</strong>. Tämä
              piilottaa kalenterin varauksilta, mutta säilyttää sen
              järjestelmässä myöhempää käyttöä varten.
            </p>
            <p>
              Kun kalenteri on lisätty, se on oletuksena "ei aktiivinen" ja
              pitää aktivoida, jotta se tulee näkyviin sovelluksessa.
            </p>
            <p>
              Kaikki kalenterimuutokset päivittyvät reaaliaikaisesti. Kalenterin
              poistaminen poistaa myös kaikki sen varaukset.
            </p>
            <p>
              Kalenterit voidaan värikoodata selkeyden parantamiseksi. Värit
              eivät vaikuta toiminnallisuuteen, mutta näkyvät analytiikkasivun
              graafeissa.
            </p>
          </div>

          <div className="flex gap-4 mt-2">
            <img
              src="/admin/kuvat/colorwheel.png"
              alt="Värikoodauksen valinta"
              className="max-w-40 rounded-md cursor-pointer hover:opacity-80 transition"
              onClick={() => openImage("/admin/kuvat/colorwheel.png")}
            />
            <img
              src="/admin/kuvat/activatecalendar.png"
              alt="Kalenterin aktivointi"
              className="max-w-40 rounded-md cursor-pointer hover:opacity-80 transition"
              onClick={() => openImage("/admin/kuvat/activatecalendar.png")}
            />
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-1 space-y-8">
              <Tablet className="h-5 w-5 text-gray-500" /> Tablettien hallinta
            </h4>
            <div className="p-2 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-900 text-xs mb-2 mt-4">
              <strong>Tärkeää:</strong> Tablettien IP-osoitteiden tulee olla{" "}
              <strong>staattisia</strong>. Jos IP-osoite vaihtuu, backend ei
              pysty autentikoimaan tablettia.
            </div>
            <p>
              Hallinnoi tabletteja, jotka sijaitsevat koppien edessä. Lisää
              uudet tabletit järjestelmään ja määritä, mitä kalenteria ne
              näyttävät.
            </p>
            <p>
              <strong>Nimi</strong> ja <strong>Lokaatio</strong> ovat vain
              visuaalisia kenttiä käyttäjän näkymässä.
            </p>
            <p>
              Tabletin <strong>Kalenteri-ID:n</strong> tulee olla olemassa oleva
              kalenteri <strong>Kalenterit</strong>-välilehdeltä ja viitata
              kyseiseen koppiin.
            </p>
            <p>
              IP-osoite on välttämätön tabletin tunnistamiseen. Tabletteja voi
              värikoodata visuaalisuuden parantamiseksi.
            </p>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-1 space-y-8">
              <UsersIcon className="h-5 w-5 text-gray-500" /> Käyttäjähallinta
            </h4>
            <p className=" mt-4">
              Lisää tai poista käyttäjiä admin-paneelista. Käyttäjille voidaan
              antaa joko <strong>admin</strong>- tai <strong>user</strong>
              -oikeudet.
            </p>
            <p>
              <strong>Admin</strong> näkee kaikki admin-paneelin toiminnot.{" "}
              <strong>User</strong> näkee vain <strong>Analytiikka</strong>- ja{" "}
              <strong>Info</strong>-välilehdet.
            </p>
            <div className="p-2 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-900 text-xs mt-2">
              <strong>HUOM!</strong> Jos poistat kaikki käyttäjät, uusi käyttäjä
              on lisättävä manuaalisesti suoraan tietokantaan.
            </div>
          </div>

          <img
            src="/admin/kuvat/users.png"
            alt="Käyttäjähallinta"
            className="max-w-40 rounded-md cursor-pointer hover:opacity-80 transition"
            onClick={() => openImage("/admin/kuvat/users.png")}
          />
        </div>
      </Card>

      <Card>
        <h4 className="flex items-center gap-2 text-gray-900 font-semibold mb-1 space-y-8">
          <Info className="h-5 w-5 text-blue-500" /> Ylläpito
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Sovelluksella ei ole virallista ylläpitoa.</p>
          <p>
            Mahdollisia ongelmia voi ilmetä esimerkiksi Googlen API-muutosten
            vuoksi.
          </p>
          <p>
            Mikäli admin-paneelissa ilmenee ongelmia, kirjaudu ulos ja kokeile
            uudelleen.
          </p>
          <p>
            Sovelluksen lähdekoodi:{" "}
            <span className="font-medium">[Repo-likki tulossa]</span>
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Yhteystiedot</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Tuki:</strong> Virallista tukea ei ole. Mahdollista apua voi
            saada organisaation tietohallinnolta.
          </p>
          <p>
            <strong>Hätätilanne:</strong> Pahimmassa tapauksessa voit ottaa
            yhteyttä joel.ryynanen [at] gmail.com
          </p>
        </div>
      </Card>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="max-w-3xl w-full relative">
            <img
              src={activeImage ?? ""}
              alt="Suurennettu kuva"
              className="w-full rounded-lg shadow-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow text-gray-800"
            >
              ✕
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
