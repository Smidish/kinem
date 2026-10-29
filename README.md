# Kollektiv Kinem – Website

Plain static site: open `index.html` in a browser. No build step.

```
index.html              Startseite (Hero, 5 Shows mit Stickern, Philosophie-Teaser)
shows/*.html            Eine Seite pro Show
philosophie.html        Philosophie mit Gruppenfoto und Notizen
assets/css/style.css    Farben (oben in :root), Layout, Sticker, Grid
assets/js/main.js       Smooth Scroll, Parallax, fliegende Sticker/Bilder, Glitzer-Cursor
assets/img/             Web-Versionen der Fotos (WebP, max. 2400 px)
src/pics/               Originale – liegen nur lokal, werden NICHT hochgeladen (.gitignore)
```

## Inhalte ändern
- **Texte** stehen direkt im HTML. Alle Zitate, Termine, Fakten und Beschreibungen sind Platzhalter.
- **Bilder tauschen:** komprimierte Datei nach `assets/img/` legen (siehe unten) und den `src` im HTML anpassen.
- **Sticker:** `<div class="sticker …" data-fly="left|right|up">`. `data-fly` bestimmt, von wo der Sticker beim Scrollen hereinfliegt. Varianten: `sticker--dark`, `sticker--white`, `sticker--tape` (Klebestreifen, für alle Zitate von Kinems und Gästen).
- **Parallax-Ebenen:** jedes Element mit `data-speed="…"` scrollt schneller (z. B. `2`) oder langsamer/gegenläufig (z. B. `-0.6`).
- **Akzentfarbe:** `--pink` in `assets/css/style.css`.

## Bilder komprimieren
Ziel: **WebP, längste Seite 2400 px, Qualität ~78** → meist 100–400 KB pro Foto.

- **Ohne Installation:** [squoosh.app](https://squoosh.app) im Browser – Bild reinziehen, rechts „WebP“, Qualität 75–80, „Resize“ auf 2400 px, Download.
- **Viele auf einmal (Terminal):** `brew install webp`, dann pro Bild
  `cwebp -q 78 -resize 2400 0 -metadata none original.jpg -o assets/img/name.webp`
  (`-resize 2400 0` = 2400 px breit; bei Hochformat `-resize 0 2400`).
- `-metadata none` bzw. Squoosh entfernen auch GPS-Daten aus Handyfotos – wichtig, bevor Bilder öffentlich online gehen.

## Videos komprimieren
Aktuell ist kein Video eingebunden. Für später:

Ziel: **H.264-MP4, 1080p, ohne Ton, „Fast Start“** → ca. 10–20 MB pro Minute.

- **Mit App:** [HandBrake](https://handbrake.fr) (kostenlos). Preset „Fast 1080p30“, dann: Video → Constant Quality **RF 26**, Encoder Preset „Slow“; Audio → Spur entfernen; Summary → **„Web Optimized“** anhaken.
- **Terminal:** `brew install ffmpeg`, dann
  ```
  ffmpeg -i original.mp4 -vf "scale=1920:-2" -c:v libx264 -preset slow -crf 26 \
         -pix_fmt yuv420p -an -movflags +faststart assets/video/name.mp4
  ```
  Höhere `-crf`-Zahl = kleinere Datei (28 ist für Hintergrundvideos auch noch gut).
- Für die Startseite reicht oft ein kurzer Loop (10–20 s, `-t 20` ergänzen). Lange Videos besser auf YouTube/Vimeo.
- GitHub erlaubt max. 100 MB pro Datei, empfohlen sind < 50 MB.

## Hosting auf GitHub Pages
1. Auf github.com ein neues **öffentliches** Repository anlegen (z. B. `kinem-website`), ohne README.
2. Im Terminal in diesem Ordner:
   ```
   git remote add origin https://github.com/DEIN-NAME/kinem-website.git
   git push -u origin main
   ```
3. Im Repo: **Settings → Pages → Source: „Deploy from a branch“, Branch `main`, Ordner `/ (root)`** → Save.
4. Nach 1–2 Minuten ist die Seite unter `https://DEIN-NAME.github.io/kinem-website/` online.

Änderungen danach: `git add -A && git commit -m "…" && git push` – die Seite aktualisiert sich automatisch.
Eigene Domain (z. B. kinem-kollektiv.de): Settings → Pages → Custom domain, plus DNS-Eintrag beim Domain-Anbieter.

## Passwortschutz
Alle Seiten zeigen zuerst eine Passwortabfrage (Passwort: `immernochKimnem`). Wer es einmal eingegeben hat, wird auf diesem Gerät nicht mehr gefragt.

- **Das ist ein Sichtschutz, keine echte Sicherheit:** GitHub Pages kann nur Dateien ausliefern. Die Abfrage passiert im Browser. Wer den Quelltext öffnet oder direkte Bild-Links kennt, kommt trotzdem an die Inhalte, und das Repository selbst ist öffentlich.
- Suchmaschinen sollen die Seite nicht listen (`<meta name="robots" content="noindex">` in jeder Seite).
- **Passwort ändern:** den Hash des neuen Passworts (FNV-1a, kleingeschrieben) an zwei Stellen eintragen: in `assets/js/main.js` (`ACCESS_HASH`) und im kleinen Skript oben im `<head>` jeder HTML-Seite.
- **Schutz entfernen (Livegang):** das `<script>` mit „password gate“ und die `robots`-Zeile aus dem `<head>` jeder Seite löschen.
- Echter Passwortschutz geht z. B. mit Netlify oder Cloudflare Pages (serverseitig).

## Gemeinsame Kommentare
Die Seite `mitmachen.html` speichert Kommentare über Supabase, damit sie für alle Besucher sichtbar sind. Für die Einrichtung:

1. In Supabase ein Projekt anlegen und den **Project URL** sowie den öffentlichen **anon/publishable key** kopieren. Niemals den `service_role`-Key in die Website eintragen.
2. Den Inhalt von `supabase-comments.sql` im Supabase SQL Editor ausführen.
3. `assets/js/comments-config.js` öffnen und `SUPABASE_PROJECT_URL` und `SUPABASE_PUBLISHABLE_OR_ANON_KEY` ersetzen.
4. Die Änderungen nach GitHub pushen und GitHub Pages aktivieren.

Die Datenbank erlaubt öffentliches Lesen und anonymes Schreiben, speichert keinen Namen und keine E-Mail-Adresse. Eine Moderation ist damit nicht aktiviert; die Supabase-Tabelle sollte bei Bedarf regelmäßig kontrolliert werden.

Für bereits eingerichtete Projekte bitte zusätzlich `supabase-comments-shows.sql` ausführen. Dadurch werden die fünf Show-Seiten und die Philosophie-Seite als weitere Kommentarbereiche freigeschaltet.

## Hinweise
- Animationsbibliotheken (GSAP, Lenis) und Schriften (Fraunces, Space Grotesk, Caveat) kommen per CDN bzw. Google Fonts. Für DSGVO-Konformität die Fonts später selbst hosten.
- Für eine öffentliche Seite in Deutschland braucht es ein echtes Impressum und eine Datenschutzerklärung (Links im Footer sind noch Platzhalter).
- Mit „Bewegung reduzieren“ im Betriebssystem wird die Seite ruhig dargestellt.
