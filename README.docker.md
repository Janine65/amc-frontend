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
