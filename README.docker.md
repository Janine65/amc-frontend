# AMC Frontend (`janine65/amcfrontend`)

Angular-Frontend der internen Vereinsverwaltung des Auto-Moto-Club Swissair. Ausgeliefert über unprivilegiertes NGINX (läuft als Non-Root, UID 101).

## Stack

- Angular (PrimeNG, Tailwind), Build via pnpm
- `nginxinc/nginx-unprivileged` (Alpine), Port **4200**
- Integrierter Reverse-Proxy: `/amcbackend/` → Backend-Service `amcbackend:3001`

## Tags

| Tag | Bedeutung |
|---|---|
| `latest` | aktueller Build von `main` |
| `x.y.z` | Release-Version (entspricht `package.json`) |

## Verwendung

Das Frontend erwartet das Backend im selben Docker-Netzwerk unter dem Hostnamen `amcbackend`:

```yaml
services:
  amcbackend:
    image: janine65/amcbackend:latest
    env_file: .env-prod
    ports:
      - "3001:3001"

  amcfrontend:
    image: janine65/amcfrontend:latest
    depends_on:
      - amcbackend
    ports:
      - "4200:4200"
```

Danach: `http://localhost:4200`

Standalone (ohne Backend-Proxy-Funktion nur eingeschränkt nutzbar):

```bash
docker run -d -p 4200:4200 janine65/amcfrontend:latest
```

## Details

- **Healthcheck** integriert (`wget` auf `http://127.0.0.1:4200/`, alle 30 s).
- NGINX cached Backend-Antworten nicht (`Cache-Control: no-store`) – wichtig hinter Synology-Reverse-Proxy.
- SPA-Routing: unbekannte Pfade werden auf `index.html` umgeschrieben.
- Backend-Auflösung erfolgt pro Request über Docker-DNS; das Frontend startet auch, wenn das Backend noch nicht läuft.

## Zusammenspiel

Backend-Image: [`janine65/amcbackend`](https://hub.docker.com/r/janine65/amcbackend)

## Privater Statistik-Schlüssel

Die Compose-Dateien enthalten keinen `ANALYTICS_SECRET`-Wert mehr.
Die Homepage lädt ausschließlich diesen Schlüssel aus einer separaten Datei:

| Compose-Datei | Private Datei neben der Compose-Datei | Backend-Konfiguration |
|---|---|---|
| `docker-compose.yml` | `.env.analytics.prod` | `../amc-backend-py/.env.prod` |
| `docker-compose-test.yml` | `.env.analytics.test` | `../amc-backend-py/.env.test` |

Die private Datei enthält genau eine Variable:

```dotenv
ANALYTICS_SECRET=HIER_DEN_PRIVATEN_SCHLUESSEL_EINTRAGEN
```

Der Wert muss mit `ANALYTICS_SECRET` in der jeweiligen Backend-Konfiguration
übereinstimmen. Die Backend-Env-Datei nicht komplett an die Homepage weitergeben:
Sie enthält weitere Zugangsdaten, die die Homepage nicht benötigt.

Beide privaten Dateien werden durch die bestehenden `.env*`-Regeln von Git
und vom Docker-Build ausgeschlossen. Die Dateien auf der Synology separat
bereitstellen, im Ordner der dort verwendeten Compose-Datei, und nur für den
ausführenden Benutzer lesbar machen. Die vorhandenen Build-/Compose-Befehle
bleiben unverändert.

Bereits in Git veröffentlichte Schlüssel gelten als offengelegt: einen neuen
Schlüssel erzeugen, in beiden zugehörigen Env-Dateien ersetzen und Backend
sowie Homepage neu erstellen. Das Entfernen aus der aktuellen Compose-Datei
entfernt den alten Wert nicht aus der Git-Historie.
