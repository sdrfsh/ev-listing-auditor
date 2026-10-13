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

### 2️⃣ Create `frontend/.env.local`

```env
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

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
| ⚙️ Backend API | http://localhost:3000 |
| 📖 API docs (Swagger) | http://localhost:3000/docs |
| ❤️ Health check | http://localhost:3000/health-check |
| 🐘 Postgres | `localhost:5431` |
| 🦙 Ollama | `localhost:11434` |

---

## 📁 Project map

```
ev-listing-auditor/
├── compose.yaml        🐳 Postgres (pgvector) + Ollama
├── .env                🔑 shared settings (not committed)
├── backend/            🐱 NestJS + TypeORM
│   └── src/
│       ├── vehicles/     cars
│       ├── issues/       seller reports + confirm/reject
│       ├── extraction/   VIN regex + LLM prompt
│       └── migrations/   DB schema
└── frontend/           ▲ Next.js + MUI
    ├── app/            pages (seller chat, /admin)
    └── lib/            API calls
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
| `yarn lint` | Lint |

</details>

---

## 🔌 API cheat sheet

<details>
<summary>Show endpoints</summary>

**Vehicles**
- `GET /vehicles` — list (`?limit=&offset=`)
- `GET /vehicles/:id`
- `GET /vehicles/seller/:seller_id`
- `POST /vehicles/create`

**Issues**
- `POST /issues/report` — ⭐ seller free text → pending issues
- `PUT /issues/:id/status` — `confirmed` or `rejected`
- `GET /issues` — list (`?limit=&offset=`)
- `GET /issues/:id`
- `GET /issues/vehicle/:vehicle_id`
- `GET /issues/vin/:vin`
- `GET /issues/seller/:seller_id`
- `POST /issues/create`

Full details + try-it-out: **http://localhost:3000/docs**

</details>

---

## 🧯 Troubleshooting

| 😵 Problem | 💡 Try |
| --- | --- |
| Backend can't reach the database | `docker compose ps` — is `db` running? Port is **5431**, not 5432. |
| Chat says *"could not understand"* | Model not pulled yet. Run `docker compose logs ollama-pull`. |
| Chat asks for a VIN | Add the 17-character VIN to the message. |
| Frontend shows no data | Check `API_URL` in `frontend/.env.local` and that the backend is up. |
| CORS error in browser | `FRONTEND_URL` in `.env` must match the frontend URL. |

---

## 🧪 Want a different AI?

Any **OpenAI-compatible** API works. Change 3 lines in `.env`:

```env
LLM_BASE_URL=https://your-provider/v1
LLM_MODEL=your-model
LLM_API_KEY=your-key
```
