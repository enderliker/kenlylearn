# Implementation Plan: StudyAI — Aplicación de Estudio con IA

## Overview

StudyAI es una aplicación web de estudio personal inspirada en Astra AI. El usuario sube materiales de estudio (PDFs, imágenes, textos) y la IA (NVIDIA Nemotron-3 Ultra 550B) genera resúmenes claros, explicaciones sencillas, y exámenes simulacro con múltiples formatos de preguntas (opción múltiple, verdadero/falso, respuesta abierta, completar espacios). La aplicación está diseñada para un solo usuario (el dueño) con una interfaz moderna, limpia y responsive.

## Tech Stack

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui | SSR, componentes modernos, desarrollo rápido |
| **Backend/API** | Next.js API Routes (Route Handlers) | Mismo proyecto, sin server separado |
| **Base de datos** | SQLite via Drizzle ORM | Simple, sin infraestructura extra, perfecto para app personal |
| **LLM** | NVIDIA Nemotron-3 Ultra 550B via API OpenAI-compatible (`@ai-sdk/openai-compatible` + AI SDK) | El modelo que el usuario eligió. Context: 1M tokens. Soporta reasoning mode. |
| **Procesamiento PDF** | `pdf-parse` (Node.js) | Extraer texto de PDFs |
| **OCR para imágenes** | Tesseract.js (server-side en API routes) | Extraer texto de imágenes |
| **Almacenamiento archivos** | Sistema de archivos local (`./uploads`) | Simple, app personal |
| **Streaming** | Vercel AI SDK (`ai` package) | StreamingTextResponse nativo con Next.js |

## Architecture Decisions

1. **Monorepo Next.js** — Frontend y backend en un solo proyecto para simplicidad. No necesitamos microservicios para una app personal.

2. **SQLite + Drizzle ORM** — Base de datos embebida sin necesidad de PostgreSQL/MySQL. Drizzle da type-safety y migraciones. Para una app personal es perfecto.

3. **API OpenAI-compatible + AI SDK** — El API de NVIDIA NIM usa el formato OpenAI. Usamos `@ai-sdk/openai-compatible` (Vercel AI SDK) que se integra nativamente con Next.js para streaming. Base URL: `https://integrate.api.nvidia.com/v1`, modelo: `nvidia/nemotron-3-ultra-550b-a55b`.

4. **Pipeline de extracción de texto** — Nemotron-3 Ultra es text-only (no procesa imágenes directamente). Necesitamos extraer texto de PDFs con `pdf-parse` y de imágenes con OCR (Tesseract.js) antes de enviarlo al modelo.

5. **Streaming para respuestas largas** — Los resúmenes y explicaciones pueden ser largos. Usamos streaming SSE via AI SDK para mostrar las respuestas progresivamente.

6. **Reasoning mode** — El modelo soporta reasoning configurable via `extra_body.chat_template_kwargs.enable_thinking`. Lo usamos activado para evaluación de respuestas abiertas (necesita razonar) y desactivado para generación rápida de resúmenes.

7. **Context window masivo (1M tokens)** — El modelo soporta hasta 1M tokens de contexto, lo que permite procesar materiales muy largos sin necesidad de chunking agresivo. Aun así implementamos chunking para materiales extremadamente largos.

8. **Sin login, sin auth** — App personal para un solo usuario. Sin middleware de autenticación.

9. **Dark mode only** — Sin toggle, sin modo claro. Colores oscuros con acentos sutiles. Sin gradientes ni decoraciones excesivas. Tipografía limpia.

10. **Rate limiting local (40 RPM)** — La API gratis tiene 40 requests/minuto. Implementamos un rate limiter simple en el cliente para evitar errores 429. Cola de requests con delay si se acerca al límite.

11. **Persistencia total** — Todo se guarda en la DB: resúmenes, explicaciones, exámenes, respuestas, evaluaciones. Nada es efímero. El usuario puede volver a cualquier material y ver todo lo generado.

6. **Estructura de "Materias"** — Los materiales se organizan en materias/cursos como Astra AI para mantener el contexto separado.

## Dependency Graph

```
SQLite Schema (Drizzle)
    │
    ├── API Models / Types (TypeScript)
    │       │
    │       ├── Upload & Text Extraction Pipeline
    │       │       │
    │       │       └── Material CRUD API
    │       │               │
    │       │               └── Upload UI Component
    │       │
    │       ├── AI Service (Nemotron API)
    │       │       │
    │       │       ├── Summary Generation API
    │       │       │       └── Summary UI
    │       │       │
    │       │       ├── Explanation Generation API
    │       │       │       └── Explanation UI
    │       │       │
    │       │       └── Quiz Generation API
    │       │               └── Quiz UI (MCQ, T/F, Open, Fill-blank)
    │       │
    │       └── Progress Tracking
    │               └── Dashboard UI
    │
    └── Seed Data / Migrations
```

## Task List

Tasks tracked in `tasks/todo.md`.

### Phase 1: Foundation (Proyecto + DB + Estructura base)
- [ ] Task 1: Scaffold del proyecto Next.js con dependencias
- [ ] Task 2: Schema de base de datos y migraciones
- [ ] Task 3: Layout principal y navegación

### Checkpoint: Foundation
- [ ] El proyecto compila sin errores
- [ ] La DB se crea con las tablas correctas
- [ ] La navegación funciona entre páginas

### Phase 2: Upload & Extracción de Texto
- [ ] Task 4: Pipeline de extracción de texto (PDF + imágenes + texto plano)
- [ ] Task 5: API de upload y CRUD de materiales
- [ ] Task 6: UI de upload con drag-and-drop y gestión de materiales

### Checkpoint: Upload
- [ ] Se puede subir un PDF y ver el texto extraído
- [ ] Se puede subir una imagen y ver el texto OCR
- [ ] Los materiales se guardan en la DB y se pueden listar/eliminar

### Phase 3: Generación con IA — Resúmenes y Explicaciones
- [ ] Task 7: Servicio de IA (wrapper Nemotron API con streaming)
- [ ] Task 8: API y UI de resúmenes
- [ ] Task 9: API y UI de explicaciones sencillas

### Checkpoint: IA Básica
- [ ] Se genera un resumen desde un material subido
- [ ] Se genera una explicación sencilla de un tema
- [ ] Las respuestas se muestran con streaming

### Phase 4: Exámenes Simulacro
- [ ] Task 10: API de generación de exámenes (múltiples formatos)
- [ ] Task 11: UI de examen — Opción múltiple y Verdadero/Falso
- [ ] Task 12: UI de examen — Respuesta abierta y Completar espacios
- [ ] Task 13: Evaluación de respuestas y retroalimentación con IA

### Checkpoint: Exámenes
- [ ] Se genera un examen con preguntas variadas desde un material
- [ ] El usuario puede responder cada tipo de pregunta
- [ ] Se evalúan las respuestas y se da feedback

### Phase 5: Dashboard y Progreso
- [ ] Task 14: Tracking de progreso y resultados de exámenes
- [ ] Task 15: Dashboard con estadísticas y áreas de mejora

### Checkpoint: Completo
- [ ] Flujo completo funcional: subir → resumir → estudiar → examinar
- [ ] Dashboard muestra progreso real
- [ ] Revisión final antes de usar en producción

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Nemotron API tiene rate limits o créditos limitados | High | Cachear respuestas generadas en la DB. No regenerar si ya existe. Mostrar créditos restantes si es posible. |
| OCR de imágenes con mala calidad | Medium | Permitir al usuario editar el texto extraído antes de procesar con IA. Mostrar preview del texto. |
| PDFs con tablas/gráficos complejos no extraen bien | Medium | Informar al usuario qué se extrajo. Permitir pegar texto manualmente como fallback. |
| Respuestas largas del modelo exceden tokens | Medium | Limitar max_tokens y paginar contenido. Resumir por secciones si el material es muy largo. |
| Materiales muy grandes exceden contexto (1M tokens) | Low | El modelo soporta 1M tokens, pero textos gigantes se dividen en chunks y se procesan por secciones. |

## Decisiones del Usuario (Resueltas)
- ✅ **Sin login** — App 100% personal, un solo usuario
- ✅ **Dark mode only** — Sin modo claro, sin toggle. Diseño oscuro minimalista
- ✅ **API key disponible** — El usuario ya tiene su key de NVIDIA
- ✅ **Todo se guarda** — Exámenes, respuestas, resúmenes, explicaciones. Para estudio real.
- ✅ **Diseño minimalista** — Sin gradientes, sin excesos. Limpio, funcional, sobrio.
- ✅ **Rate limit: 40 RPM** — API gratis. Implementar rate limiting y cola de requests.
