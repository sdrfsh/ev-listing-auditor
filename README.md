# ⚡ EV Listing Auditor

> **TL;DR:** A seller types *"oh, it also has winter tires and the battery is at 91%"*.
> A small local AI turns that into **suggested edits**. An employee clicks **Confirm** or **Reject**. Done.

---

## 🧭 Jump to

| I want to… | Go to |
| --- | --- |
| Get it running fast | [🚀 Quick start](#-quick-start-5-steps) |
| Understand how it works | [🧠 How it works](#-how-it-works-30-seconds) |
| Find a URL or port | [🔗 Where things live](#-where-things-live) |
| Build images / deploy | [🐳 Docker, CI & Kubernetes](#-docker-ci--kubernetes) |
| Fix something broken | [🧯 Troubleshooting](#-troubleshooting) |

---

## 🧠 How it works (30 seconds)

```
Seller message ──► Backend finds VIN ──► Local LLM finds edits ──► Pending issues ──► Employee confirms ──► Car updated ✅
```

1. **Seller** writes a normal sentence in the chat.
2. **VIN** (17 characters) is found with a regex. No VIN → the app asks for it.
3. **AI** pulls out edits. Only 3 fields can change:
   - `mileage` (km)
   - `batteryHealth` (%)
   - `equipments` (add an item, or remove it with `-tow bar`)
4. Each edit becomes a **pending issue**.
5. **Employee** confirms → the vehicle row is updated. Rejects → nothing changes.

---

## 🧰 What you need

- [ ] **Docker** (runs Postgres + Ollama)
- [ ] **Node 24** + **Yarn 4** (pinned with Volta)

That's it.

---

## 🚀 Quick start (5 steps)

### 1️⃣ Create `.env` in the repo root

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ev_auditor

LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:3b
LLM_API_KEY=
FRONTEND_URL=http://localhost:3001
```

<details>
<summary>Optional settings (defaults shown)</summary>

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5431
PORT=3000            # backend port
```

</details>

### 2️⃣ Create `frontend/.env.local`

```env
API_URL=http://localhost:3000/api
```

⚠️ Keep the `/api` suffix — every backend route lives under it.

### 3️⃣ Start the database + AI

```bash
docker compose up -d
```

⏳ First run downloads the model. Give it a minute.

### 4️⃣ Start the backend

```bash
cd backend
yarn install
yarn start:dev
```

✅ Database migrations run **automatically** on start.

### 5️⃣ Start the frontend (new terminal)

```bash
cd frontend
yarn install
yarn dev
```

🎉 Open **http://localhost:3001**

---

## 🔗 Where things live

| What | URL |
| --- | --- |
| 🛒 Seller chat | http://localhost:3001 |
| 🧑‍💼 Admin dashboard | http://localhost:3001/admin |
| 🚗 Admin · vehicles | http://localhost:3001/admin/vehicles (add one at `/admin/vehicles/new`) |
| 📝 Admin · issues | http://localhost:3001/admin/issues |
| ⚙️ Backend API | http://localhost:3000/api |
| 📖 API docs (Swagger) | http://localhost:3000/api/docs (JSON: `/api/docs-json`) |
| 🐘 Postgres | `localhost:5431` |
| 🦙 Ollama | `localhost:11434` |

---

## 📁 Project map

```
ev-listing-auditor/
├── compose.yaml        🐳 Postgres (pgvector) + Ollama (local dev)
├── .env                🔑 shared settings (not committed)
├── backend/            🐱 NestJS + TypeORM
│   ├── Dockerfile
│   └── src/
│       ├── vehicles/     cars
│       ├── issues/       seller reports + confirm/reject
│       ├── extraction/   VIN regex + LLM prompt
│       └── migrations/   DB schema
├── frontend/           ▲ Next.js + MUI
│   ├── Dockerfile
│   ├── app/            pages (seller chat, /admin/vehicles, /admin/issues)
│   │   └── components/ shared UI (chat, drawer, header)
│   └── lib/            API calls + server actions
├── k8s/                ☸️ Deployments, Services, Tailscale Ingress
└── .github/workflows/  🤖 build + push images to GHCR
```

---

## 🛠️ Everyday commands

<details>
<summary><b>Backend</b> (run inside <code>backend/</code>)</summary>

| Command | Does |
| --- | --- |
| `yarn start:dev` | Run with auto-reload |
| `yarn test` | Unit tests |
| `yarn test:e2e` | End-to-end tests |
| `yarn lint` | Lint |
| `yarn build` | Lint + build |
| `yarn migration:generate src/migrations/Name` | New migration from entity changes |
| `yarn migration:run` | Apply migrations |
| `yarn migration:revert` | Undo last migration |
| `yarn migration:show` | List migrations |

</details>

<details>
<summary><b>Frontend</b> (run inside <code>frontend/</code>)</summary>

| Command | Does |
| --- | --- |
| `yarn dev` | Run on port 3001 |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn lint` | Lint |

</details>

---

## 🔌 API cheat sheet

<details>
<summary>Show endpoints</summary>

All routes are prefixed with **`/api`**. Lists take `?limit=` (1–100, default 10) and `?offset=`.

**Vehicles**
- `GET /api/vehicles` — list
- `GET /api/vehicles/:id`
- `GET /api/vehicles/seller/:seller_id`
- `POST /api/vehicles/create`

**Issues**
- `POST /api/issues/report` — ⭐ seller free text → pending issues
- `PUT /api/issues/:id/status` — `confirmed` or `rejected`
- `GET /api/issues` — list
- `GET /api/issues/:id`
- `GET /api/issues/vehicle/:vehicle_id`
- `GET /api/issues/vin/:vin`
- `GET /api/issues/seller/:seller_id`
- `POST /api/issues/create`

Full details + try-it-out: **http://localhost:3000/api/docs**

</details>

---

## 🐳 Docker, CI & Kubernetes

**Images** — each app has its own multi-stage `Dockerfile` (Node 24 Alpine, non-root, `tini`).

```bash
docker build -t ev-backend  backend
docker build -t ev-frontend frontend

docker run -p 3000:3000 --env-file .env \
  -e POSTGRES_HOST=host.docker.internal \
  -e LLM_BASE_URL=http://host.docker.internal:11434/v1 \
  ev-backend
docker run -p 3001:3001 -e API_URL=http://host.docker.internal:3000/api ev-frontend
```

- Backend listens on **3000**, frontend on **3001**.
- `API_URL` is read at **runtime** (server side), so no build args are needed.
- Migrations still run automatically when the backend starts.

**CI** — GitHub Actions push images to GHCR:

| Trigger | Result |
| --- | --- |
| Push to `main` (changes in `backend/` or `frontend/`) | Build + push `sha-<short>`, `main`, `latest` |
| Tag `v*` | Build + push both images with semver tags |
| Pull request | Build only |

Images: `ghcr.io/sdrfsh/ev-listing-auditor-backend` and `ghcr.io/sdrfsh/ev-listing-auditor-frontend`.

**Kubernetes** — manifests in [`k8s/`](k8s/):

- `backend/` + `frontend/` — Deployment + Service each (pull secret `regcred`).
- `ingress.yaml` — Tailscale Ingress (Funnel): `/api` → backend, `/` → frontend.
- Backend expects a Secret `postgres-pwd` (key `pwd`) and an external Postgres + Ollama.

```bash
kubectl apply -f k8s/ -R
```

🔁 To deploy a new build, bump the `image:` tag (`sha-…`) in the matching `deployment.yaml`.

---

## 🧯 Troubleshooting

| 😵 Problem | 💡 Try |
| --- | --- |
| Backend can't reach the database | `docker compose ps` — is `db` running? Port is **5431**, not 5432. |
| Chat says *"could not understand"* | Model not pulled yet. Run `docker compose logs ollama-pull`. |
| Chat asks for a VIN | Add the 17-character VIN to the message. |
| Frontend shows no data | Check `API_URL` in `frontend/.env.local` (must end in `/api`) and that the backend is up. |
| API returns 404 | You forgot the `/api` prefix. |
| CORS error in browser | `FRONTEND_URL` in `.env` must match the frontend URL. |

---

## 🧪 Want a different AI?

Any **OpenAI-compatible** API works. Change 3 lines in `.env`:

```env
LLM_BASE_URL=https://your-provider/v1
LLM_MODEL=your-model
LLM_API_KEY=your-key
```
