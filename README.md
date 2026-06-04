# ⚽ App Mundial — Predicciones con Probabilidades Reales

Una aplicación web interactiva donde los usuarios predicen los clasificados de cada grupo del Mundial de Fútbol y reciben retroalimentación matemática sobre la probabilidad real de que sus predicciones ocurran.

## 🏗️ Stack Tecnológico (Opción A)

| Componente | Tecnología |
|---|---|
| Backend / API | Node.js + Express 5 |
| Base de datos | PostgreSQL + Prisma ORM |
| Frontend | React 19 + Vite 6 |
| HTTP Client | axios |
| Validación | zod |
| Worker (Fase 2) | node-cron |

## 📁 Estructura del Proyecto

```
Appmundial/
├── server/           # Backend Express
│   └── src/
│       ├── adapters/     # Patrón Adapter para APIs externas
│       ├── config/       # DB, env, constantes
│       ├── middleware/   # Error handling
│       ├── prisma/       # Schema y migraciones
│       ├── routes/       # Endpoints REST
│       └── services/     # Lógica de negocio
├── client/           # Frontend React + Vite
│   └── src/
│       ├── components/   # Componentes reutilizables
│       ├── pages/        # Páginas
│       ├── hooks/        # Custom hooks
│       └── services/     # API client
├── poc/              # Prueba de Concepto
├── shared/           # Constantes compartidas
└── package.json      # Root workspace
```

## 🚀 Quick Start

### Prerrequisitos

- Node.js >= 18
- PostgreSQL (o cuenta en Railway/Neon para DB remota)
- API Keys: [Football-Data.org](https://www.football-data.org/client/register) + [The Odds API](https://the-odds-api.com/#get-access)

### Instalación

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys y URL de PostgreSQL

# 3. Generar cliente Prisma
npm run -w server db:generate

# 4. Crear tablas en la DB
npm run -w server db:push

# 5. Iniciar ambos servidores
npm run dev
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia backend (3001) + frontend (5173) |
| `npm run dev:server` | Solo backend |
| `npm run dev:client` | Solo frontend |
| `npm run poc` | Ejecuta la Prueba de Concepto |
| `npm run -w server db:studio` | Abre Prisma Studio (GUI de la DB) |

## 📐 Arquitectura

```
                    ┌──────────────┐
                    │  APIs Externas │
                    │  Football-Data │
                    │   The Odds API │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │   CAPA DE INGESTA       │
              │   Adapters + Worker     │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   PostgreSQL (Prisma)   │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   CAPA DE NEGOCIO       │
              │   Motor de Probabilidad │
              │   API REST (Express)    │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   CAPA DE PRESENTACIÓN  │
              │   React + Vite          │
              └─────────────────────────┘
```

> **Principio clave:** La UI **nunca** llama a APIs externas directamente. Siempre consume datos de la base de datos propia.

## 📊 Fórmulas

**Probabilidad implícita:**
```
P(%) = (1 / Cuota) × 100
```

**Probabilidad combinada:**
```
P(A ∩ B ∩ ... ∩ N) = P(A) × P(B) × ... × P(N)
```

## 📝 Documentación

- [Plan de Acción Completo](./plan-accion-mundial-app.md.md)
- [Prueba de Concepto](./poc/football-data-poc.js)

---

*Desarrollado como parte del proyecto App Mundial de Predicciones.*
