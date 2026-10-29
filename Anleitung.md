# Tafel-App – Kurzanleitung

Eine digitale Tafel für das Smartboard. Läuft ohne Installation in Microsoft Edge.

## Starten

1. Einmalig: **„Desktop-Verknüpfung erstellen.bat“** doppelklicken. Auf dem Desktop erscheint „Tafel-App“.
2. Danach immer über die Verknüpfung oder **„Tafel starten.bat“** starten. Edge öffnet die Tafel als eigenes Fenster ohne Adressleiste. Mit **⛶** oben rechts (oder F11) geht es in den Vollbildmodus.
3. Am SMART Board: besser **„Tafel-App (ohne SMART Ink)“** nehmen (Verknüpfung bzw. „Tafel starten (ohne SMART Ink).bat“) – siehe Abschnitt „SMART Board“ unten.

**Auf Schul-PCs mit Sperren:** „Desktop-Verknüpfung erstellen.bat“ probiert nacheinander drei Wege (PowerShell → VBScript → einfache Verknüpfung ohne Skript) und zeigt im Fenster an, welcher geklappt hat. Bei der einfachen Verknüpfung fragt Windows beim ersten Start evtl. „Möchten Sie diese Datei öffnen?“ → „Öffnen“. Klappt keiner der Wege, bitte ein Foto des Fensters machen. Die Tafel startet dann trotzdem mit Doppelklick auf „Tafel starten.bat“ im Ordner.

**Ist PowerShell gesperrt,** beendet „Tafel starten (ohne SMART Ink)“ SMART Ink trotzdem beim Start. SMART Ink startet dann aber nicht von selbst wieder, sondern erst nach dem Neuanmelden oder einem Neustart.

Der ganze Ordner `Tafel-App` kann auf einen USB-Stick oder einen anderen PC kopiert werden. Auf dem Board-PC einfach dort die Verknüpfung neu erstellen.

## Erster Start: Ablageordner und Lehrkraft

- **Ablageordner wählen** (z. B. einen Ordner „Tafeln“ in OneDrive oder im synchronisierten IServ-Ordner). Edge fragt einmal, ob die App dort speichern darf: „Bearbeitung zulassen“. Nach einem Neustart reicht ein Tipp auf **„✓ Ordner freigeben“**.
- Die App legt die Unterordner selbst an: **Ablageordner › Lehrkraft › Fach › „2026-10-27 Titel.tafel.json“**. Jede Lehrkraft hat ihren Ordner. Liegt der Ablageordner in einem geteilten IServ-Ordner, sehen Kolleginnen und Kollegen auch Ihre Tafeln.
- **Lehrkraft** antippen oder mit „＋ Neu“ anlegen (Name oder Kürzel), dann **Fach** antippen, Titel eingeben und **„＋ Neue Tafel“**.
- Gespeicherte Tafeln erscheinen beim Fach mit Datum. **„Öffnen“** bearbeitet die Tafel weiter, **„⧉ Als Vorlage“** macht eine Kopie mit heutigem Datum (z. B. für die Parallelklasse oder das nächste Schuljahr).
- **🗑** löscht eine Tafel nach einer Rückfrage. Sie kommt in den **Papierkorb** (Ordner „Lehrkraft › _Papierkorb“). Unter der Liste erscheint dann „🗑 Papierkorb (…)“, dort lässt sie sich mit **„↩ Wiederherstellen“** zurückholen. Endgültig entfernen lässt sie sich nur im Windows-Explorer, indem man die Datei im Ordner _Papierkorb löscht.

**Speichern:** Die App speichert automatisch alle 20 Sekunden in den Ordner. Zusätzlich gibt es **💾 Speichern** (Strg+S). Oben steht „✓ gespeichert 10:41“. Wurde eine Datei inzwischen an einem anderen PC geändert, überschreibt die App sie **nicht**. Ihre Fassung landet dann als „(Konflikt)“-Kopie daneben.
Ohne Ablageordner wird beim Speichern eine Datei heruntergeladen. Mit **„📂 Datei öffnen …“** lässt sie sich wieder laden, z. B. aus IServ. Nach einem Absturz bietet der Startbildschirm **„Wiederherstellen“** an.

## Zuhause vorbereiten, in der Schule öffnen

Die App braucht keine Installation, sie läuft überall, wo Microsoft Edge ist (zu Hause und am Board-PC).

**Am bequemsten: Ein gemeinsamer Ordner, der sich synchronisiert**
1. Den ganzen Ordner `Tafel-App` auf beide Rechner bringen, z. B. weil er in OneDrive liegt oder per USB-Stick.
2. Auf beiden Rechnern **denselben synchronisierten Ordner** als Ablageordner wählen, z. B. `OneDrive\Tafeln` oder einen per IServ synchronisierten Ordner.
3. Zu Hause Tafel anlegen und speichern. In der Schule erscheint sie nach der Synchronisierung bei Lehrkraft › Fach in der Liste und lässt sich öffnen.
   Wird dieselbe Tafel an zwei Rechnern geändert, überschreibt die App nichts, sondern legt eine „(Konflikt)“-Kopie an.

**Ohne Synchronisierung: per Datei (z. B. über IServ)**
1. Zu Hause: **⤓ Export → „Tafel-Datei herunterladen“**. Die Datei `….tafel.json` in IServ (Dateien) hochladen oder auf einen USB-Stick kopieren.
2. In der Schule: Datei aus IServ herunterladen, in der Tafel-App auf **📁 Tafeln → „📂 Datei öffnen …“** tippen und die Datei wählen. Mit 💾 Speichern landet sie dann im Ablageordner der Schule.

Dauerhafte Notizen (📌) und Störungsnotizen liegen nicht in der Tafel-Datei, sondern im Ablageordner. Sie wandern also nur über den synchronisierten Ordner mit.

## Android-Board (installierbare Web-App)

Die App lässt sich auf Android-Boards und -Tablets **wie eine App installieren** (Symbol auf dem Startbildschirm, Vollbild, läuft danach auch offline). Voraussetzung: Sie liegt **einmal unter einer https-Adresse** (z. B. GitHub Pages oder Schul-Webspace). Dann:

1. Die Adresse im **Chrome-Browser** des Boards öffnen.
2. Menü ⋮ → **„App installieren“** bzw. „Zum Startbildschirm hinzufügen“.

**Speichern auf Android:** Android-Browser können keinen frei wählbaren Ordner verbinden. Die Tafeln liegen deshalb **im Speicher der App auf dem Gerät** (gleiche Ordnung Lehrkraft › Fach). Wichtig:
- Regelmäßig **📁 Tafeln → „💾 Sicherung exportieren“** – das ergibt *eine* Datei mit allen Tafeln und Notizen (auf USB-Stick, in IServ hochladen …).
- Auf einem anderen Gerät (auch Windows) mit **„📂 Datei öffnen / 📥 Sicherung einspielen“** übernehmen. Vorhandene Tafeln werden dabei nie überschrieben.
- Einzelne Tafeln gehen weiterhin über **⤓ Export → Tafel-Datei**.

**Nur kurz online stellen:** Die App muss nicht dauerhaft im Internet liegen. Sie können sie hochladen, auf allen Boards installieren (dabei die App auf jedem Board **einmal öffnen**, damit sie vollständig gespeichert wird) und die Webseite danach wieder löschen. Die installierten Apps laufen weiter, die Tafeln bleiben auf den Boards. Zu beachten:
- **Neue Versionen** kommen dann nicht mehr an. Für ein Update die Webseite kurz wieder hochladen (gleiche Adresse!) und die App auf jedem Board einmal mit Internet öffnen.
- Die **Adresse** muss beim erneuten Hochladen genau gleich sein, sonst gilt es als neue App – ohne die gespeicherten Tafeln.
- **Board zurückgesetzt oder Browserdaten gelöscht** → App und Tafeln sind weg. Deshalb regelmäßig „💾 Sicherung exportieren“.
- PDF einfügen braucht weiterhin Internet (der PDF-Leser wird nachgeladen).

Die Windows-Version (Ordner `Tafel-App` mit `Tafel.html`) bleibt unverändert nutzbar; beide Versionen verstehen dieselben Dateien.

## Schreiben

| Werkzeug | Bedienung |
|---|---|
| **Stift** | Schreibt druckempfindlich und geglättet. 7 Farben, „Regenbogen“ für mehr Farben, 4 Stärken **S / M / L / XL** (die gewählte hat einen lila Rahmen; beim Radierer gilt dasselbe für die Radiergröße). **Nochmals antippen:** Stiftart wählen – normaler Stift oder **Kalligrafie-Feder** (breite Feder: Abstriche dick, Haarstriche dünn; der Knopf heißt dann „Feder“). |
| **Marker** | Durchsichtiger Textmarker, liegt immer *unter* der Schrift. |
| **Radierer** | Radiert Stellen weg. Nochmals antippen: „Ganze Striche“ oder „Seite leeren“. Die Stift-Rückseite bzw. -Taste radiert auch. |
| **Auswahl** | Element antippen: verschieben, mit ⤡ vergrößern, mit ↻ drehen. Rahmen ziehen wählt mehrere aus. Leiste darüber: Bearbeiten, Kopie, Vorne/Hinten, Löschen. Doppelt antippen öffnet die Einstellungen eines Bausteins. |
| **Tafel verschieben** | Die ganze Tafel mit dem Stift verschieben (mit dem Finger geht das immer). Wiederfinden: unten rechts **⤢ Alles zeigen** oder **⌂ Start**. |
| **Formen** | Linie, Pfeil, Rechteck, Dreieck, **Kreis** (vom Mittelpunkt aus ziehen, Radius in cm wird angezeigt), Ellipse. Linien rasten bei 0°/45°/90° ein, die Länge wird in cm angezeigt. |
| **Text** | Auf die Tafel tippen und Text eingeben (Bildschirmtastatur über das Tastatursymbol der Taskleiste). |
| **Zurück / Vor** | Rückgängig / Wiederholen (Strg+Z / Strg+Y). |
| **Wischen** | Fragt kurz nach: **✍ Nur Handschrift** (Bausteine/Vorlagen bleiben – praktisch zum Wiederverwenden), **🧩 Nur Bausteine & Bilder** (Handschrift bleibt) oder **🗑 Alles**. Was es auf der Seite nicht gibt, ist ausgegraut. Danach „↶ Zurück“ zum Rückgängigmachen. |

**Brüche im Text:** Schreiben Sie in einen Text „3/4“, erscheint ein richtiger Bruch mit Bruchstrich (Zähler über Nenner). Das gilt auch für alle Aufgaben aus dem Aufgabengenerator.

**Navigation (unten rechts):** **⤢ Alles zeigen** zoomt so, dass alles auf der Seite sichtbar ist – damit findet man nach dem Verschieben alles wieder. **＋ / −** zoomen, die **Prozentzahl** antippen = zurück auf 100 %, **⌂ Start** springt an den Anfang der Seite (100 %). Tastatur: Pos1 = Start, Ende = Alles zeigen.

**Finger:** Ein Finger verschiebt die Tafel, zwei Finger zoomen (auf Lineal/Geodreieck: drehen und vergrößern). Ein Finger auf einem Baustein verschiebt den Baustein. Der Handballen bzw. eine große Fläche radiert. Unter ⚙ Einstellungen lässt sich das umstellen (Finger radiert / Finger schreibt).

**Seiten:** ◀ ▶ blättern, **Neu** hängt eine Seite an. Ein Tipp auf „1 / 3“ öffnet: Seite kopieren, löschen, Ansicht 100 % und **Hintergrund** (weiß, kariert, liniert, Schreiblinien, Punkte, Notenlinien, Tafelgrün, grün kariert, schwarz). Auf dunklem Hintergrund wird schwarze Schrift automatisch weiß angezeigt. Jede Seite ist unendlich groß.
Darunter lassen sich **Kästchengröße, Linien- bzw. Punktabstand** einstellen (feste Werte oder eigene Zahl in mm). **Standard: Kästchen 20 mm, Linien 20 mm, Punkte 20 mm, Schreiblinien-Mittelband 15 mm** – gut lesbar am Board. Bei 100 % Ansicht entsprechen die Maße dem Lineal der App. Neue Seiten übernehmen Hintergrund und Abstand der aktuellen Seite.

**Hell / Dunkel:** Der Knopf 🌓 oben wechselt zwischen *Automatisch* (wie Windows), *Hell* ☀️ und *Dunkel* 🌙. Er betrifft Leisten, Menüs, Dialoge und Notizen; die Tafel selbst behält ihren Hintergrund (für eine dunkle Tafel: Hintergrund „Schwarz“ oder „Tafelgrün“).

## Seitenleiste: Werkzeuge, Einfügen, Aufgaben, Classroom

Die Knöpfe **Werkzeuge**, **Einfügen** und **Aufgaben** in der unteren Leiste öffnen links eine **Seitenleiste**, die Tafel rückt nach rechts (geteiltes Fenster). Nochmals antippen oder **×** schließt sie wieder.

- **🛠 Werkzeuge:** Lineal, Geodreieck, Winkelmesser, Zirkel (antippen = ein/aus) und der **wissenschaftliche Rechner**.
- **🎒 Classroom:** Vorhang, Phasentimer, Timer/Stoppuhr, Namen ziehen, Würfel (auch über **🎒 Classroom** oben).
- **🧩 Einfügen:** oben die Kategorien (Bilder & Text, 3D-Körper, Mathe, Deutsch & Englisch, NaWi/Erdkunde/Geschichte, Karten, Abdeckung), darunter die Grafiken. Antippen setzt sie in die Tafelmitte. Anpassen danach über **✏️ Bearbeiten**.
- **🧮 Aufgaben:** der Aufgabengenerator (siehe unten). Die Leiste bleibt offen, man kann mehrere Aufgabenblöcke nacheinander einfügen.

## Messwerkzeuge (Lineal, Geodreieck, Winkel, Zirkel)

- Ein-/ausblenden in der Seitenleiste **Werkzeuge** (oder das rote **×** am Werkzeug).
- **Verschieben:** Werkzeug mit Finger oder Stift in der Mitte anfassen.
- **Drehen:** am blauen **↻** ziehen (rastet bei 15° ein) oder mit zwei Fingern drehen.
- **Größer/kleiner:** mit **zwei Fingern aufziehen** (wie beim Zoomen) – oder **↻ kurz antippen**: Dort gibt es Winkel (z. B. 37°) und Größen (75 % bis 300 %). Die Skala zählt dann weiter in „Werkzeug-Zentimetern“, so dass die Klasse am vergrößerten Geodreieck ablesen kann.
- **Fangfunktion:** Setzen Sie den Stift an eine Kante (Lineal, alle drei Geodreieck-Seiten, Winkelmesser-Grundlinie und -Bogen). Dann wird exakt an der Kante entlang gezeichnet, auch wenn die Hand zittert. Die Länge (in cm der Skala) bzw. der Winkel wird angezeigt.
- **Zirkel:** ✥ (Nadel) verschiebt den Zirkel, **↔** (Mine) verstellt den Radius (Anzeige „r = 3,5 cm“). **↻** oben drehen zeichnet einen Kreisbogen, **◯** zeichnet sofort den ganzen Kreis.

## Bausteine anpassen – Felder antippen

Die Vorlagen sind zum **Hineinschreiben mit dem Stift** gedacht und lassen sich jederzeit anpassen (Werkzeug **Auswahl** oder mit dem Finger):

1. **Baustein antippen** → oben erscheinen **Schnellknöpfe**, z. B. bei der Tabelle *＋ Zeile, ＋ Spalte, alle höher, alle breiter*; bei der Mindmap *＋ Ast, alle Felder größer*; beim Versuchsprotokoll *＋ Feld, 1/2 Spalten*; bei der Zuordnung *＋ Paar, Karten breiter/höher*; beim Zahlen-/Zeitstrahl *＋ Schritt, Abstand größer*; beim Koordinatensystem *＋ Bereich, Einheit größer, Raster*; bei Bruchkreis/-streifen *＋ Teil, ＋ färben*; bei der Lernuhr *+5 min*.
2. **Ein einzelnes Feld noch einmal antippen** (Zelle, Mindmap-Ast, Protokollfeld, Karte) → es wird blau markiert und das **Feld-Menü** erscheint: *Zeile höher/niedriger, Spalte breiter/schmaler, Zeile darüber/darunter, Spalte links/rechts, Feld größer/kleiner, Ast daneben, Feld/Zeile/Spalte löschen*. **✕** hebt die Markierung auf.
3. **Doppelt antippen** öffnet wie bisher **✏️ Bearbeiten** (Texte und Zahlen eintippen).

**Die Handschrift wandert mit:** Was mit dem Stift in ein Feld geschrieben wurde, bleibt in seinem Feld – wird davor eine Zeile eingefügt oder eine Spalte breiter, rutscht die Schrift mit. Beim **Verschieben** eines Bausteins kommt die Handschrift, die darauf steht, ebenfalls mit. (Beim Vergrößern mit ⤡ wird die Handschrift nicht mitvergrößert – dafür lieber die Feld-Knöpfe nutzen.)

## Funktionsplotter

**Werkzeuge → 📈 Funktionsplotter** öffnet ein großes Fenster: links die Eingaben, rechts das Koordinatensystem.

- **Eingabe:** per Tastatur oder über die **Bildschirmtasten** (x, x², ^, √, sin, π, a, b, c …) – praktisch am Board ohne Tastatur. Beispiele: `2x+1`, `0,5x^2−3`, `a(x−b)^2+c`, `2^x`, `e^x`, `sin(x)`, `√x`, `ln(x)`, `1/x`. Malpunkte darf man weglassen (2x, ax, 2sin(x)). Bis zu 6 Funktionen, jede mit eigener Farbe (Farbpunkt antippen = andere Farbe), ein-/ausblendbar.
- **Schieberegler:** Jeder Buchstabe außer x und e (a, b, c, d, k, m, n …) wird automatisch zum Schieberegler – so sieht man live, wie sich der Graph streckt, staucht oder verschiebt.
- **Bewegen:** Bild mit Finger/Stift verschieben, **mit zwei Fingern zoomen** (oder Mausrad, ＋/−), ⌂ = Standardansicht. Die Achsenteilung passt sich automatisch an (1er-, 2er-, 5er-Schritte …); für Trigonometrie gibt es **„x-Achse in π-Schritten“**. x und y haben immer die gleiche Einheit.
- **Markante Punkte:** Nullstellen (N), Hoch-/Tiefpunkte (H/T), Wendepunkte (W), y-Achsenabschnitt (S) – mit Koordinaten (zwei Nachkommastellen, numerisch berechnet).
- **Werkzeuge:** **Tangente** (Gleichung und Steigung m), **Sekante** durch zwei Punkte, **Steigungsdreieck** (Δx frei wählbar, Δy und m), **Fläche/Integral** zwischen zwei Grenzen (Integralwert und Fläche). Die blauen Kreise im Bild lassen sich ziehen.
- **Wertetabelle:** Funktion, Bereich und Schrittweite wählen; „⤴ Wertetabelle auf die Tafel“ legt sie als Tabelle ab.
- **⤴ Auf die Tafel** legt den Graphen als Bild auf die Tafel – zum Beschriften mit dem Stift. Antippen und **„📈 Im Plotter öffnen“** holt ihn mit allen Einstellungen zurück; danach „✓ Auf der Tafel aktualisieren“.
- **Grenzen:** Handgeschriebene Formeln werden nicht automatisch erkannt (dafür bräuchte es einen Online-Dienst bzw. ein KI-Modell). Die Bildschirmtasten ersetzen die Tastatur. Merkmale werden numerisch bestimmt – bei sehr steilen oder exotischen Funktionen bitte kurz kontrollieren.

## Wissenschaftlicher Rechner

In der Seitenleiste **Werkzeuge**: Grundrechenarten, Klammern, Potenzen (xʸ, x²), Wurzel, sin/cos/tan (Umschalter **DEG/RAD**), ln/log, n!, π, %, 1/x und **Ans** (letztes Ergebnis). Nach „=“ startet eine neue Zahl eine neue Rechnung, ein Rechenzeichen rechnet mit dem Ergebnis weiter. **⤴ Rechnung auf die Tafel** rechnet (falls noch nicht geschehen) aus und setzt „Rechnung = Ergebnis“ gut lesbar in die Mitte der sichtbaren Tafel – dort ist sie gleich ausgewählt und lässt sich verschieben.

## Einfügen (Bausteine und Vorlagen)

Alle Bausteine lassen sich verschieben, skalieren und drehen. **✏️ Bearbeiten** ändert sie nachträglich (Maße, Zahlen, Inhalte).

- **3D-Körper als Schrägbild:** Würfel, Quader, Pyramide, Dreiecksprisma, Zylinder, Kegel, Kugel. Wahlweise mit Eckenbeschriftung (ABCD…) bzw. r und h. Verdeckte Kanten sind gestrichelt.
- **Mathe:** Koordinatensystem (mit **Funktionsplotter**, z. B. `2x+1` oder `0,5x^2-3`), Zahlenstrahl, Bruchkreis, Bruchstreifen, **schriftliches Rechnen** (Kästchengerüst für +, −, ·, : mit Stellenwerten und Übertragszeile), Stellenwerttafel, Hundertertafel, Lernuhr, Tabelle.
- **Deutsch & Englisch:** **Vokabeltabelle** (Wort = Übersetzung; eine Spalte lässt sich für die Abfrage verdecken), **Zuordnung** (zwei Kartenspalten zum Verbinden, auch gemischt), Satzbau-Tabelle (Englisch S-V-O-P-T, deutsches Feldermodell, Satzglieder, Wortarten), Mindmap, Venn-Diagramm.
- **NaWi, Erdkunde, Geschichte:** Zeitstrahl, Klimadiagramm (leer oder mit 12 Werten), Versuchsprotokoll, Bevölkerungspyramide, Periodensystem (Hauptgruppen, auch leer zum Ausfüllen), Schaltzeichen.
- **Karten** (Kategorie 🗺️ Karten): oben die **Kartenart** wählen, dann das Gebiet antippen.
  - **Gebiete:** Welt, Europa, Afrika, Asien, Nordamerika, Südamerika, Australien & Ozeanien, Deutschland und **jedes der 16 Bundesländer** (das Land hervorgehoben, Nachbarländer blass).
  - **Kartenarten:** **🗺 Politisch** (Staaten bzw. Bundesländer farbig, Namen, Hauptstädte), **⛰ Physisch** (farbiges Geländerelief, Flüsse, Seen, Gebirge und Landschaften – in Deutschland z. B. Harz, Schwarzwald, Alpenvorland – und die höchsten Gipfel), **◻ Stumm** (nur Umrisse, zum Beschriften mit dem Stift).
  - Nach dem Einfügen lässt sich oben direkt umschalten: Politisch / Physisch / Stumm, Namen, Städte, Flüsse, Landschaften, Gradnetz.
  - **Quelle:** Natural Earth (naturalearthdata.com) – gemeinfrei, frei verwendbar und weitergebbar. Die Landschaftsnamen in Deutschland sind eine eigene Zusammenstellung. Das Relief stammt aus einer weltweiten Karte; für Deutschland und besonders kleine Bundesländer ist es daher etwas weich gezeichnet.
  - Die Kartendaten liegen im Ordner `app/karten` (ca. 3 MB) und werden erst geladen, wenn eine Karte gebraucht wird.
- **🦴 Skelette:** Mensch, Katze, Hund, Vogel (Huhn, nummeriert), Pferd (nummeriert), Fisch, Frosch – zum Beschriften mit dem Stift. Quelle: Wikimedia Commons, frei lizenziert (überwiegend gemeinfrei). Unter jedem Bild steht eine kleine Quellenzeile; beim **Hund** (Lizenz CC BY-SA 3.0, A. Spielhoff) muss sie stehen bleiben, bei den anderen darf sie gelöscht werden.
- **Abdeckung:** grauer „Vorhang“, der über allem liegt. Zum Aufdecken einfach wegschieben.
- **Bild** (auch per Strg+V oder Hineinziehen) und **PDF-Seiten**: Jede PDF-Seite wird eine eigene Tafelseite, auf der man schreiben kann. Für PDFs braucht die App einmalig Internet, weil der PDF-Leser nachgeladen wird.

## 🎲 Übungen (Kärtchen, Lückentext, Multiple Choice)

**Einfügen → 🎲 Übungen:** Art wählen, im Textfeld den Inhalt eintragen (es steht immer ein Beispiel drin; der Knopf „Beispiel“ setzt es zurück), **⤴ Auf die Tafel**.

| Art | So eintragen | An der Tafel |
|---|---|---|
| **Kärtchen sortieren** | je Zeile `Gruppe: Begriff, Begriff, …` | Kärtchen in die passende Gruppe ziehen |
| **Reihenfolge** | je Zeile ein Schritt, in der richtigen Reihenfolge | Kärtchen in die nummerierten Felder ziehen |
| **Zuordnen** | je Zeile `links = rechts` (z. B. `dog = Hund`) | rechte Kärtchen neben das passende linke ziehen |
| **Lückentext** | Lückenwörter in `[eckige Klammern]`; optional Zeile `Ablenker: Wort, Wort` | Wortkärtchen in die Lücken ziehen |
| **Multiple Choice** | 1. Zeile Frage, dann Antworten; richtige mit `*` davor | Antworten antippen (mehrere möglich) |

- Kärtchen lassen sich **mit Finger oder Stift** ziehen – auch wenn gerade der Stift gewählt ist, malt man dabei nicht. Nahe am Ziel **rasten sie ein**.
- **✓ Prüfen** färbt richtig grün und falsch rot. **↺ Mischen** setzt alles zurück und mischt neu. **💡 Lösung** legt alles an den richtigen Platz.
- Die Übung wird mit der Tafel gespeichert – sie lässt sich zuhause vorbereiten.

## 📊 Diagramme und Messwerttabelle

**Einfügen → 📊 Diagramme:**

- **Diagramm:** Säulen, Balken, Linie, Punkte oder Kreis. Daten im Bearbeiten-Dialog, je Zeile `Beschriftung;Wert` (erste Zeile = Achsennamen, z. B. `Tag;Temperatur in °C`). Mehrere Werte je Zeile ergeben mehrere Reihen in eigenen Farben. Oben lässt sich die Art direkt umschalten.
- **Ausgleichsgerade** (bei Punkt- und Liniendiagramm): Bei Zahlen auf der x-Achse steht die Gleichung `y ≈ m·x + b` dabei; bei Text auf der x-Achse (Mo, Di, …) zeigt sie nur den Trend.
- **Messwerttabelle:** Größen mit Einheit als Spaltenköpfe, leere Zeilen zum Eintragen mit dem Stift. **＋ Messung** / **＋ Größe** erweitern sie. Sind Werte eingetragen (✏️ Bearbeiten), macht **📊 Diagramm daraus** ein Punktdiagramm daneben.

## 📐 Formelsammlung

**Einfügen → 📐 Formeln:** Formeln mit echtem Bruchstrich, sortiert nach Mathe (Flächen, Körper, Algebra & Funktionen), Physik und Chemie. Antippen setzt die Formel auf die Tafel; danach lässt sie sich wie jeder Baustein vergrößern und verschieben.

## Aufgabengenerator

**Aufgaben** in der Werkzeugleiste öffnet den Generator in der Seitenleiste: oben den **Jahrgang** wählen (Alle, 5 … 10), dann ein **Thema**, Niveau **★ / ★★ / ★★★**, Anzahl. „🎲 Neu würfeln“ erzeugt neue Zahlen, **⤴ Auf die Tafel** setzt sie ein.

Die 51 Themen für Jg. 5–10 sind nach Bereichen geordnet, angelehnt an das Kerncurriculum Mathematik Niedersachsen (Oberschule, Doppeljahrgänge 5/6, 7/8, 9/10). Neben jedem Thema steht, für welche Jahrgänge es gedacht ist:

- **Grundrechenarten & natürliche Zahlen:** Stellenwerte, Runden, + − · :, Einmaleins, Punkt vor Strich, Potenzen, Teiler/ggT/kgV/Primfaktoren
- **Brüche & Dezimalzahlen:** kürzen/erweitern, vergleichen, Bruch–Dezimalzahl–Prozent, Bruchteile, rechnen mit Brüchen und Dezimalzahlen
- **Ganze & rationale Zahlen:** + − · : mit negativen Zahlen, rationale Zahlen
- **Größen & Einheiten:** Längen, Gewichte, Zeit/Zeitspannen, Flächen- und Volumeneinheiten, Maßstab
- **Geometrie:** Rechteck/Quadrat, Würfel/Quader, Winkel, Dreieck/Parallelogramm/Trapez, Kreis, Pythagoras, Körper (Zylinder, Pyramide, Kegel, Kugel), Sinus/Kosinus/Tangens
- **Zuordnungen, Prozent & Zinsen:** Dreisatz (proportional/antiproportional), Prozentrechnung, Rabatt/MwSt., Zinsen/Zinseszins
- **Terme & Gleichungen:** Terme zusammenfassen, Klammern, binomische Formeln, lineare Gleichungen, Gleichungssysteme, quadratische Gleichungen, Wurzeln/Potenzen
- **Funktionen:** lineare und quadratische Funktionen, exponentielles Wachstum
- **Daten & Zufall:** Mittelwert/Median/Spannweite, Wahrscheinlichkeit (auch zweistufig)

Gerundete Ergebnisse (π, Wurzeln, Zinseszins) stehen mit „≈“ und 2 Nachkommastellen in der Lösung.

- **Platz zum Rechnen:** *wenig / mittel / viel* – so viele freie Kästchenzeilen bleiben unter jeder Aufgabe (1 / 3 / 6) und so viel Platz daneben. „viel“ ist für schriftliches Rechnen gedacht.
- **Jede Aufgabe ist ein eigenes Element** – mit dem Werkzeug „Auswahl“ (oder dem Finger) einzeln auseinanderziehen und gemeinsam rechnen.
- **Auf karierten Seiten in Kästchenschrift:** Jede Ziffer und jedes Rechenzeichen sitzt in einem Kästchen, Brüche stehen über zwei Kästchen mit dem Bruchstrich auf der Karolinie. Beim Verschieben rasten die Aufgaben im Kästchenraster ein. Textaufgaben (z. B. Prozent) stehen als normaler Text am Raster.
- Die Lösungen landen auf Wunsch **unter einer Abdeckung** neben den Aufgaben oder auf einer neuen Seite. Bei „Lineare Funktionen ★★“ werden die Geraden gleich ins Koordinatensystem gezeichnet.
- Passen nicht alle Aufgaben auf den Bildschirm, zoomt die App die Ansicht passend heraus (⌂ unten rechts = zurück auf 100 %).
- Auch eigener Text kann in Kästchenschrift stehen: im Text-Dialog **„▦ In Kästchen“**.

## Classroom

In der Werkzeugleiste **Classroom** (oder **🎒 Classroom** oben):

- **😀 Emojis:** über 100 Emojis in Gruppen (Lob, Gesichter, Zeichen, Schule, Natur & Tiere, Herzen) und vier Größen (klein bis riesig). Emoji antippen, dann setzt jedes Tippen auf die Tafel eins. Zurück zum Schreiben: Stift antippen.
- **🕘 Uhr & Datum** in großer Schrift.
- **🤫 Arbeitssymbole:** zeigt beliebig viele Symbole groß an. Antippen öffnet die Auswahl: Lautstärke, Arbeitsform, Verhalten (Melden, Stopp, Erst 3 fragen …), Material (Buch, Heft, Geodreieck, Taschenrechner …) und Ablauf. Jedes Symbol antippen = an/aus. Mit **＋ Eigenes Symbol** eigene Symbole mit Text und Emoji anlegen (Windows: **Win + .** öffnet die Emoji-Auswahl). Die Auswahl bleibt gespeichert.
- **🚦 Ampel:** Licht antippen schaltet um.
- **🔊 Lautstärke:** misst über das Mikrofon den Geräuschpegel (Balken und Smiley, Grenze einstellbar). Es wird nichts aufgenommen oder gespeichert; der Browser fragt einmal nach der Mikrofon-Erlaubnis.
- **📊 Umfrage:** Frage eingeben, Art wählen (**Multiple Choice** A–F, **Smileys**, **Wahr/Falsch**, **Daumen**), „Abstimmung starten“. Jedes Antippen einer Antwort zählt eine Stimme (z. B. Kinder kommen nach vorne oder Handzeichen zählen). Ergebnis erst verbergen, dann mit „📊 Ergebnis zeigen“ als Balken aufdecken; „⤴ Auf die Tafel“ legt das Diagramm ab.
- **🏆 Punktestand:** 2–6 Teams mit Namen, +1/+5/−1, bleibt gespeichert.
- **👥 Gruppen bilden:** aus der Klassenliste zufällige Gruppen (Personen pro Gruppe oder Anzahl Gruppen), neu mischen, auf die Tafel.
- **🔳 QR-Code:** Link oder Text eingeben – der QR-Code entsteht sofort, auch ohne Internet, und kann auf die Tafel gelegt werden (z. B. Link zu einer IServ-Aufgabe oder LearningApp).
- **🎭 Vorhang:** deckt die ganze Tafel ab (Werkzeugleiste und Notizen bleiben bedienbar). An allen vier Seiten sitzt ein Griff (▼ ▲ ▶ ◀): **ziehen** zieht den Vorhang von dieser Seite stufenlos auf, **kurz antippen** öffnet ihn um ein Stück (10 %). Von mehreren Seiten kombinierbar – so lässt sich ein Tafelbild Zeile für Zeile oder Spalte für Spalte aufdecken. In der Mitte: ↺ schließt ihn wieder ganz, × entfernt ihn. Unter dem Vorhang kann nicht versehentlich gezeichnet werden.
- **⏳ Phasentimer:** mehrere Phasen nacheinander, z. B. Einstieg 5 min → Erarbeitung 20 min → Sicherung 15 min. Phasen benennen, Minuten eintragen, mit ↑ umsortieren, mit ＋ ergänzen, oder eine **Vorlage** wählen (Unterrichtsstunde, Doppelstunde, Think–Pair–Share, Gruppenarbeit, Stationenlernen). Beim Wechsel ertönt ein Signal; der farbige Balken zeigt den Fortschritt, darunter steht die nächste Phase. ⏸ Pause, +1 min, ⏭ Nächste, ⏹ Beenden. Die zuletzt geplanten Phasen merkt sich die App.
- **⏱ Timer / Stoppuhr** mit Signalton
- **🎯 Zufallsauswahl** von Namen, ohne Wiederholung. Die Namenslisten bleiben nur auf diesem Gerät im Browser gespeichert.
  - **📥 Aus Datei (Excel / CSV):** unter „✏️ Liste“ eine Excel-Datei (.xlsx) oder CSV-Datei wählen, z. B. einen Export aus IServ oder der Schulverwaltung. Spalten wie „Vorname“, „Nachname“, „Klasse“ werden erkannt. Übernommen werden nur die **Vornamen**; gibt es einen Vornamen doppelt, kommt der Anfangsbuchstabe des Nachnamens dazu („Lena M.“, „Lena S.“). Enthält die Datei mehrere Klassen, entsteht für jede eine eigene Liste. Alte .xls-Dateien bitte in Excel als .xlsx speichern.
- **🎲 Würfel** (1–3 Würfel)

Die Fenster lassen sich an der Titelleiste verschieben.

## Notizfeld (📝 Notizen)

Die Notizen hängen als **Registerkarten am rechten Rand**. Ein Tipp auf eine Karte klappt die Notiz auf; ein zweiter Tipp, das **×** oder der Knopf **📝 Notizen** oben klappt sie wieder zu. Mit **＋** legen Sie beliebig viele Notizen an.

- Jede Notiz hat einen **Titel** und eine **Farbe** (oben im Feld änderbar) und lässt sich mit 🗑 löschen.
- **Nur diese Tafel** (Standard für neue Notizen): Die Karte gehört zu dieser Tafel und wird mit ihr gespeichert.
- **📌 Dauerhaft:** Die Karte erscheint bei jeder Tafel, z. B. für Klassenregeln oder Dienste. Gespeichert wird sie unter „Lehrkraft › _Notizen“.
- Jede Notiz lässt sich **mit dem Stift beschreiben** (✍ Mit Stift: vier Farben, Radierer 🧽, Rückgängig ↶, Leeren 🗑) oder tippen (⌨ Tippen, mit A−/A+, „📋 Regel-Vorlage“ und „⤴ Auf die Tafel“).
- **Störungen:** eine einfache Notiz **für diese Stunde**: aufschreiben, was während der Stunde vorfällt. Es gibt keine Auswertung und keine Statistik. Jede Tafel bzw. Stunde hat ihre eigene Störungsnotiz.
  - **🙈 verdecken** legt einen Sichtschutz darüber, damit die Klasse nicht mitliest. Antippen zeigt die Notiz wieder.
  - Gespeichert wird **getrennt von der Tafel** unter „Lehrkraft › _Stoerungen“. Die Notiz steckt also nicht in Tafeln, die Sie exportieren oder weitergeben.
  - **Datenschutz:** Liegt der Ablageordner in einem mit Kolleginnen und Kollegen geteilten Ordner, können diese die Dateien öffnen. Dafür besser einen persönlichen Ablageordner nutzen.

**Tippen per Stift:** In jedem Eingabefeld (Titel, Namenslisten, Texte) können Sie mit der Handschrift-Eingabe von Windows schreiben. Dazu das Tastatursymbol in der Taskleiste antippen und die Handschrift-Ansicht wählen. Unter Windows 11 kann man, je nach Einstellung, auch direkt mit dem Stift ins Feld schreiben.

## Export

**⤓ Export:** aktuelle Seite oder sichtbaren Ausschnitt als **PNG**, alle Seiten als **PDF** (es öffnet sich der Druckdialog → Drucker „Als PDF speichern“ wählen, Querformat), oder die Tafel-Datei zum Weitergeben (z. B. in IServ hochladen).

## SMART Board: Wenn der Stift einen „Screenshot“ macht

Das macht nicht die Tafel-App, sondern **SMART Ink** (gehört zu den SMART-Treibern/Notebook). SMART Ink legt beim Schreiben eine eigene Ink-Ebene über Programme, die es nicht kennt. Dann landet die Schrift *über* der Tafel-App statt in ihr.

Eine Ausnahme nur für die Tafel-App gibt es in SMART Ink nicht: Dort kann man nur ganze Programme wählen, also „Microsoft Edge“ – dann wäre SMART Ink in *allen* Edge-Fenstern aus. Deshalb gibt es einen eigenen Starter:

**✅ Empfohlen: „Tafel-App (ohne SMART Ink)“** (Desktop-Verknüpfung oder `Tafel starten (ohne SMART Ink).bat`)
- Er beendet SMART Ink, öffnet die Tafel-App und hält SMART Ink aus, **solange das Tafel-Fenster offen ist**.
- Wird die Tafel-App geschlossen, startet SMART Ink **von selbst wieder** – für Notebook, PowerPoint usw. ist es danach wie gewohnt da.
- Es wird nichts an den SMART-Einstellungen verändert und nichts installiert. War SMART Ink vorher nicht an, wird es auch nicht gestartet.
- Die Verknüpfung entsteht mit „Desktop-Verknüpfung erstellen.bat“ (nur auf PCs, auf denen SMART installiert ist).
- Klappt es nicht, steht im Protokoll `%LOCALAPPDATA%\Tafel-App\start.log` (in die Adresszeile des Explorers eingeben), was passiert ist.

Weitere Möglichkeiten (die Menünamen können je nach Version abweichen):

1. **Spontan:** In der schwebenden SMART-Ink-Leiste auf den **Mauszeiger/Pfeil** („Auswählen“) tippen. Dann gibt der Stift seine Eingaben direkt an die Tafel-App weiter.
2. **Für den ganzen Browser:** Rechtsklick auf das **SMART-Ink-Symbol** im Infobereich (unten rechts) → **Einstellungen** → SMART Ink für **Microsoft Edge** ausschalten. Nachteil: dann auch in allen anderen Edge-Fenstern aus.
3. Sind Einstellungen und Starter gesperrt (z. B. darf PowerShell nicht laufen), die IT/den Schul-Admin bitten, SMART Ink für `msedge.exe` abzuschalten.

**Prüfen, ob es klappt:** Oben rechts in der Tafel-App steht nach jeder Berührung, was ankommt: **✒ Stift**, **☝ Finger** oder **🖱 Maus**.
- **✒ Stift (· Druck):** ideal. Der Stift schreibt, der Finger verschiebt.
- **🖱 Maus:** funktioniert auch, der Stift schreibt nur ohne Druckstärke.
- **☝ Finger beim Schreiben mit dem Stift:** Das Board unterscheidet Stift und Finger nicht. Dann unter ⚙ Einstellungen „Finger: schreiben wie der Stift“ wählen. Zum Verschieben zwei Finger oder das Werkzeug „Verschieben“ nehmen.

Neuere SMART-Boards erkennen auch die Stiftfarbe aus der Ablage. Diese Farbe kommt in der Tafel-App nicht an, die Farbe wählen Sie in der Werkzeugleiste.

## Tastatur

Strg+Z / Strg+Y rückgängig/wiederholen · Strg+S speichern · Entf löscht die Auswahl · Strg+D dupliziert · Bild auf/ab blättert die Seiten · Strg+Mausrad zoomt.

## Gut zu wissen

- Die Tafeldaten liegen als `.tafel.json` im Ablageordner (nicht nur im Browser). Bilder werden in die Datei eingebettet.
- Werkzeugleiste zu weit unten oder oben? Unter ⚙ Einstellungen lässt sie sich nach oben verlegen.
- Der Ordner `app` enthält das Programm. Bitte nicht als Ablageordner wählen.
