# StudyAI — Task List

> Checklist de tareas para implementar StudyAI. Cada tarea se marca como completada al pasar sus criterios de aceptación y verificación.

---

## Phase 1: Foundation

### Task 1: Scaffold del proyecto Next.js con dependencias
**Description:** Crear el proyecto Next.js 14 con App Router, TypeScript, Tailwind CSS, shadcn/ui, y todas las dependencias necesarias. Configurar estructura de carpetas, variables de entorno, y scripts de desarrollo.

**Acceptance criteria:**
- [x] Proyecto Next.js 14 con App Router y TypeScript creado
- [x] Tailwind CSS + diseño oscuro minimalista configurado
- [x] package.json configurado con todas las dependencias requeridas
- [x] Archivo `.env.local.example` y `.env.local` con variables (NVIDIA_API_KEY, etc.)
- [x] Estructura de carpetas definida: `src/app/`, `src/lib/`, `src/components/`, `src/db/`, `src/types/`

**Verification:**
- [x] Código fuente completamente estructurado en TypeScript y en inglés
- [x] Rutas y layouts configurados
- [x] Componentes de interfaz listos

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `.env.local.example`
- `.env.local`

**Estimated scope:** Medium (3-5 files + configs)

---

### Task 2: Schema de base de datos y migraciones
**Description:** Definir el schema de la base de datos con Drizzle ORM para SQLite. Incluye tablas para materias, materiales, contenido generado (resúmenes, explicaciones), exámenes, preguntas, y respuestas del usuario.

**Acceptance criteria:**
- [x] Tabla `subjects` (materias): id, name, description, color, icon, createdAt, updatedAt
- [x] Tabla `materials` (materiales subidos): id, subjectId, title, fileName, fileType, extractedText, filePath, createdAt
- [x] Tabla `generated_content` (resúmenes/explicaciones): id, materialId, type, topic, level, content, createdAt
- [x] Tabla `exams` (exámenes): id, materialId, title, totalQuestions, score, passed, status, createdAt
- [x] Tabla `questions` (preguntas): id, examId, type (mcq|truefalse|open|fillblank), questionText, options (JSON), correctAnswer, explanation
- [x] Tabla `user_answers` (respuestas): id, questionId, examId, userAnswer, isCorrect, score, aiFeedback, answeredAt
- [x] Script de seed con materias iniciales y configuración WAL

**Verification:**
- [x] Schema tipado en TypeScript con inferencias New/Select
- [x] Configuración drizzle.config.ts definida
- [x] Script de seed creado en `src/db/seed.ts`

**Dependencies:** Task 1

**Files likely touched:**
- `src/db/schema.ts`
- `src/db/index.ts`
- `drizzle.config.ts`
- `src/db/seed.ts`

**Estimated scope:** Small (3-4 files)

---

### Task 3: Layout principal y navegación
**Description:** Crear el layout principal de la aplicación con sidebar de navegación (similar a Astra AI), header, y estructura de páginas. Incluye dark mode por defecto, diseño responsive, y rutas vacías para todas las secciones.

**Acceptance criteria:**
- [x] Sidebar con navegación: Dashboard, Subjects, Upload Material, Mock Exams
- [x] Header con título de la app (dark mode fijo, sin toggle)
- [x] Dark mode only — colores neutros oscuros, sin gradientes, minimalista
- [x] Layout responsive con diseño persistente
- [x] Páginas creadas en inglés: `/`, `/subjects`, `/upload`, `/exams`
- [x] Branding mínimo, tipografía limpia, estado de guardia 40 RPM

**Verification:**
- [x] Navegación funcional entre todas las páginas
- [x] Dark mode aplicado globalmente
- [x] Código 100% en inglés

**Dependencies:** Task 1

**Files likely touched:**
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/subjects/page.tsx`
- `src/app/upload/page.tsx`
- `src/app/exams/page.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`

**Estimated scope:** Medium (5+ files)

---

## ✅ Checkpoint: Foundation
- [x] Código de la Fase 1 (Tasks 1, 2 y 3) escrito e implementado
- [x] DB schema completo con todas las tablas necesarias
- [x] Navegación y vistas principales creadas
- [x] Todo el código escrito en inglés como fue solicitado

---

## Phase 2: Upload & Extracción de Texto

### Task 4: Pipeline de extracción de texto (PDF + imágenes + texto plano)
**Description:** Crear el servicio de extracción de texto que procesa diferentes tipos de archivos. PDF → `pdf-parse`, imágenes → Tesseract.js OCR, texto → directo. Devuelve texto limpio listo para enviar a la IA.

**Acceptance criteria:**
- [ ] Función `extractText(file, fileType)` que acepta Buffer + tipo
- [ ] Extracción de texto de PDFs con `pdf-parse`
- [ ] OCR de imágenes (JPG, PNG) con Tesseract.js
- [ ] Texto plano (.txt, .md) pasa directo
- [ ] Manejo de errores: archivos corruptos, OCR fallido, PDF sin texto
- [ ] Chunking: textos largos se dividen en chunks de ~3000 tokens para respetar límites

**Verification:**
- [ ] Test: PDF con texto → extrae correctamente
- [ ] Test: imagen con texto → OCR funciona
- [ ] Test: texto plano → pasa directo
- [ ] Test: PDF sin texto → error descriptivo

**Dependencies:** Task 1

**Files likely touched:**
- `src/lib/extraction/index.ts`
- `src/lib/extraction/pdf.ts`
- `src/lib/extraction/ocr.ts`
- `src/lib/extraction/text.ts`
- `src/lib/extraction/chunker.ts`

**Estimated scope:** Medium (4-5 files)

---

### Task 5: API de upload y CRUD de materiales
**Description:** Crear los endpoints API para subir archivos, guardarlos, extraer texto, y CRUD de materiales y materias. Los archivos se guardan en `/uploads` y el texto extraído en la DB.

**Acceptance criteria:**
- [ ] `POST /api/materials/upload` — Sube archivo, extrae texto, guarda en DB
- [ ] `GET /api/materials` — Lista materiales (con filtro por materia)
- [ ] `GET /api/materials/[id]` — Detalle de un material con texto extraído
- [ ] `DELETE /api/materials/[id]` — Elimina material y archivo
- [ ] `POST /api/subjects` — Crear materia
- [ ] `GET /api/subjects` — Listar materias
- [ ] `PUT /api/materials/[id]/text` — Editar texto extraído manualmente
- [ ] Validación: tipos de archivo permitidos, tamaño máximo (20MB)

**Verification:**
- [ ] Upload de PDF vía API devuelve material con texto extraído
- [ ] CRUD de materias funciona
- [ ] Eliminar material borra archivo del disco
- [ ] Archivos inválidos devuelven error 400

**Dependencies:** Tasks 2, 4

**Files likely touched:**
- `src/app/api/materials/upload/route.ts`
- `src/app/api/materials/route.ts`
- `src/app/api/materials/[id]/route.ts`
- `src/app/api/materials/[id]/text/route.ts`
- `src/app/api/subjects/route.ts`

**Estimated scope:** Medium (5 files)

---

### Task 6: UI de upload con drag-and-drop y gestión de materiales
**Description:** Crear la interfaz de usuario para subir materiales (drag-and-drop + file picker), seleccionar materia, ver lista de materiales subidos, y preview del texto extraído con opción de editarlo.

**Acceptance criteria:**
- [ ] Zona de drag-and-drop para archivos (PDF, imágenes, texto)
- [ ] File picker como alternativa al drag-and-drop
- [ ] Selector de materia (crear nueva o elegir existente)
- [ ] Barra de progreso durante upload + extracción
- [ ] Lista de materiales subidos con: nombre, tipo, materia, fecha, tamaño
- [ ] Preview del texto extraído con opción de editar
- [ ] Botón para eliminar material
- [ ] Indicadores visuales por tipo de archivo (iconos PDF, imagen, texto)

**Verification:**
- [ ] Drag-and-drop funciona en Chrome/Firefox
- [ ] Se puede subir PDF y ver el texto extraído
- [ ] Se puede subir imagen y ver el OCR
- [ ] El texto extraído se puede editar y guardar
- [ ] La lista de materiales se actualiza al subir/eliminar

**Dependencies:** Tasks 3, 5

**Files likely touched:**
- `src/app/upload/page.tsx`
- `src/components/upload/dropzone.tsx`
- `src/components/upload/material-list.tsx`
- `src/components/upload/text-preview.tsx`
- `src/components/subjects/subject-selector.tsx`

**Estimated scope:** Medium (5 files)

---

## ✅ Checkpoint: Upload
- [ ] Se puede subir un PDF y ver el texto extraído
- [ ] Se puede subir una imagen y ver el texto OCR
- [ ] Los materiales se listan, editan, y eliminan correctamente
- [ ] Build limpio sin errores

---

## Phase 3: Generación con IA — Resúmenes y Explicaciones

### Task 7: Servicio de IA (wrapper Nemotron API con streaming)
**Description:** Crear el servicio central de comunicación con NVIDIA Nemotron-3 Ultra 550B. Usa el SDK `openai` con base URL de NVIDIA. Soporta streaming SSE y tiene prompts especializados para cada tipo de generación.

**Acceptance criteria:**
- [ ] Cliente OpenAI configurado con `https://integrate.api.nvidia.com/v1` y API key
- [ ] Función `generateStream(systemPrompt, userContent)` con streaming
- [ ] Función `generate(systemPrompt, userContent)` sin streaming (para JSON)
- [ ] Prompts templates para: resumen, explicación, generación de examen, evaluación de respuestas
- [ ] Rate limiter: máximo 40 RPM, cola de requests con delay automático
- [ ] Manejo de errores: API key inválida, rate limit (429), timeout
- [ ] Caché: si ya se generó contenido para un material, no regenerar (guardar en DB)

**Verification:**
- [ ] Llamada de prueba a la API con texto corto devuelve respuesta
- [ ] Streaming funciona: tokens llegan progresivamente
- [ ] Error handling: API key inválida muestra mensaje claro
- [ ] Caché funciona: segunda llamada devuelve resultado guardado

**Dependencies:** Task 2

**Files likely touched:**
- `src/lib/ai/client.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/stream.ts`
- `src/lib/ai/rate-limiter.ts`

**Estimated scope:** Medium (4 files)

---

### Task 8: API y UI de resúmenes
**Description:** Crear el endpoint y la UI para generar resúmenes de materiales. El resumen se genera con streaming, se muestra progresivamente, y se guarda en la DB para no regenerar.

**Acceptance criteria:**
- [ ] `POST /api/materials/[id]/summary` — Genera resumen con streaming (SSE)
- [ ] `GET /api/materials/[id]/summary` — Obtiene resumen guardado (si existe)
- [ ] UI: botón "Generar Resumen" en la vista del material
- [ ] UI: el resumen se muestra con markdown renderizado (headings, bullets, bold)
- [ ] UI: indicador de "Generando..." con texto apareciendo progresivamente
- [ ] Resumen estructurado: conceptos clave, puntos principales, conclusiones
- [ ] Se guarda en `generated_content` para no regenerar

**Verification:**
- [ ] Generar resumen de un PDF subido funciona con streaming
- [ ] El resumen se renderiza con formato markdown bonito
- [ ] Recargar la página muestra el resumen guardado sin regenerar
- [ ] Materiales largos se procesan por chunks correctamente

**Dependencies:** Tasks 5, 7

**Files likely touched:**
- `src/app/api/materials/[id]/summary/route.ts`
- `src/app/materials/[id]/page.tsx`
- `src/components/ai/summary-view.tsx`
- `src/components/ai/streaming-text.tsx`

**Estimated scope:** Medium (4 files)

---

### Task 9: API y UI de explicaciones sencillas
**Description:** Crear la funcionalidad de explicaciones simplificadas. El usuario selecciona un tema o concepto del material y la IA lo explica de forma sencilla, con analogías y ejemplos, como si le explicara a un niño.

**Acceptance criteria:**
- [ ] `POST /api/materials/[id]/explain` — body: `{ topic: string, level: 'simple'|'medium'|'detailed' }`
- [ ] UI: campo de texto para escribir qué concepto quiere que le expliquen
- [ ] UI: selector de nivel de dificultad (Simple / Intermedio / Detallado)
- [ ] Explicación con: analogías, ejemplos del mundo real, paso a paso
- [ ] Streaming de la respuesta
- [ ] Historial de explicaciones generadas para el material

**Verification:**
- [ ] Pedir explicación de un concepto devuelve respuesta clara y sencilla
- [ ] Los 3 niveles de dificultad producen respuestas distintas
- [ ] Streaming funciona correctamente
- [ ] Historial se guarda y se puede revisar

**Dependencies:** Tasks 5, 7

**Files likely touched:**
- `src/app/api/materials/[id]/explain/route.ts`
- `src/components/ai/explain-view.tsx`
- `src/components/ai/difficulty-selector.tsx`

**Estimated scope:** Small (3 files)

---

## ✅ Checkpoint: IA Básica
- [ ] Se genera un resumen con streaming desde un material subido
- [ ] Se genera una explicación sencilla con 3 niveles de dificultad
- [ ] Las respuestas se cachean en la DB
- [ ] Build limpio sin errores

---

## Phase 4: Exámenes Simulacro

### Task 10: API de generación de exámenes (múltiples formatos)
**Description:** Crear el endpoint que genera un examen completo a partir de un material. El examen incluye preguntas de múltiples formatos. La IA genera las preguntas, opciones, respuestas correctas y explicaciones en formato JSON estructurado.

**Acceptance criteria:**
- [ ] `POST /api/materials/[id]/exam` — body: `{ questionCount: number, types: string[] }`
- [ ] Tipos de preguntas soportados: `mcq`, `truefalse`, `open`, `fillblank`
- [ ] Cada pregunta tiene: enunciado, tipo, opciones (si aplica), respuesta correcta, explicación
- [ ] La respuesta es JSON estructurado (no streaming) para parsear correctamente
- [ ] El examen se guarda en tablas `exams` + `questions`
- [ ] Configuración: cantidad de preguntas (5, 10, 15, 20), tipos a incluir
- [ ] Prompt engineering para que las preguntas sean relevantes y de calidad

**Verification:**
- [ ] Generar examen de 10 preguntas devuelve JSON válido con estructura correcta
- [ ] Cada tipo de pregunta tiene el formato esperado
- [ ] Las preguntas son relevantes al material
- [ ] El examen se guarda correctamente en la DB

**Dependencies:** Tasks 5, 7

**Files likely touched:**
- `src/app/api/materials/[id]/exam/route.ts`
- `src/lib/ai/exam-generator.ts`
- `src/lib/ai/prompts.ts` (agregar prompts de examen)

**Estimated scope:** Small (3 files)

---

### Task 11: UI de examen — Opción múltiple y Verdadero/Falso
**Description:** Crear la interfaz interactiva para realizar exámenes. Incluye la vista de configuración para crear el examen y las vistas de preguntas tipo opción múltiple y verdadero/falso.

**Acceptance criteria:**
- [ ] Pantalla de configuración: seleccionar material, cantidad de preguntas, tipos
- [ ] Vista de pregunta MCQ: enunciado + 4 opciones como cards seleccionables
- [ ] Vista de pregunta V/F: enunciado + botones Verdadero/Falso
- [ ] Navegación entre preguntas: anterior/siguiente + indicador de progreso
- [ ] Feedback inmediato: correcto (verde) / incorrecto (rojo) + explicación
- [ ] Resumen final: puntaje, preguntas correctas/incorrectas, tiempo total

**Verification:**
- [ ] Configurar y generar un examen muestra las preguntas correctamente
- [ ] Seleccionar respuestas MCQ funciona (una sola selección)
- [ ] V/F muestra feedback inmediato
- [ ] El resumen final muestra puntaje correcto

**Dependencies:** Task 10

**Files likely touched:**
- `src/app/exams/page.tsx`
- `src/app/exams/[id]/page.tsx`
- `src/components/exam/exam-config.tsx`
- `src/components/exam/mcq-question.tsx`
- `src/components/exam/truefalse-question.tsx`
- `src/components/exam/exam-summary.tsx`
- `src/components/exam/progress-bar.tsx`

**Estimated scope:** Medium (7 files — borderline, but all are small focused components)

---

### Task 12: UI de examen — Respuesta abierta y Completar espacios
**Description:** Crear las vistas de pregunta para respuesta abierta (escribir con tus palabras) y completar espacios en blanco. Estos requieren un textarea/input para que el usuario escriba.

**Acceptance criteria:**
- [ ] Vista de respuesta abierta: enunciado + textarea para escribir la respuesta
- [ ] Vista de completar espacios: texto con blanks resaltados + inputs inline
- [ ] Botón "Evaluar respuesta" que envía al siguiente Task (evaluación con IA)
- [ ] Indicador visual de que la respuesta se está evaluando
- [ ] Las respuestas se integran con la navegación del examen existente

**Verification:**
- [ ] Se puede escribir una respuesta abierta y enviarla
- [ ] Los espacios en blanco se muestran como inputs inline en el texto
- [ ] La navegación funciona consistentemente con todos los tipos de pregunta

**Dependencies:** Task 11

**Files likely touched:**
- `src/components/exam/open-question.tsx`
- `src/components/exam/fillblank-question.tsx`
- `src/app/exams/[id]/page.tsx` (integrar nuevos tipos)

**Estimated scope:** Small (3 files)

---

### Task 13: Evaluación de respuestas y retroalimentación con IA
**Description:** Crear el sistema de evaluación de respuestas abiertas usando la IA. Para MCQ y V/F la evaluación es directa. Para respuestas abiertas y fill-blank, la IA evalúa si la respuesta del usuario es correcta, parcialmente correcta, o incorrecta, y da retroalimentación constructiva.

**Acceptance criteria:**
- [ ] `POST /api/exams/[id]/evaluate` — Evalúa respuesta abierta con IA
- [ ] MCQ y V/F: evaluación automática comparando con respuesta correcta
- [ ] Respuesta abierta: IA evalúa y da puntaje (correcto/parcial/incorrecto) + feedback
- [ ] Fill-blank: comparación flexible (sinónimos, variaciones) con IA
- [ ] Retroalimentación constructiva: qué faltó, qué estuvo bien, concepto que debe repasar
- [ ] Las respuestas del usuario se guardan en `user_answers`

**Verification:**
- [ ] Respuesta correcta en MCQ se marca como correcta
- [ ] Respuesta abierta buena recibe evaluación positiva
- [ ] Respuesta abierta parcial recibe feedback constructivo
- [ ] Todas las respuestas se guardan en la DB

**Dependencies:** Tasks 10, 12

**Files likely touched:**
- `src/app/api/exams/[id]/evaluate/route.ts`
- `src/lib/ai/evaluator.ts`
- `src/lib/ai/prompts.ts` (agregar prompts de evaluación)
- `src/components/exam/feedback-card.tsx`

**Estimated scope:** Medium (4 files)

---

## ✅ Checkpoint: Exámenes
- [ ] Se genera un examen con los 4 tipos de preguntas
- [ ] El usuario puede responder cada tipo correctamente
- [ ] Las respuestas abiertas se evalúan con IA y dan feedback
- [ ] Los resultados se guardan en la DB
- [ ] Build limpio sin errores

---

## Phase 5: Dashboard y Progreso

### Task 14: Tracking de progreso y resultados de exámenes
**Description:** Crear las queries y lógica para trackear el progreso del usuario: exámenes completados, puntajes, temas fuertes/débiles, historial de estudio.

**Acceptance criteria:**
- [ ] `GET /api/stats` — Estadísticas generales: total materiales, exámenes, puntaje promedio
- [ ] `GET /api/stats/subjects/[id]` — Estadísticas por materia
- [ ] `GET /api/exams/history` — Historial de exámenes con puntajes
- [ ] Cálculo de áreas fuertes y débiles basado en tipos de preguntas falladas
- [ ] Porcentaje de aciertos por materia y por tipo de pregunta

**Verification:**
- [ ] Después de completar exámenes, las estadísticas reflejan los resultados
- [ ] Áreas débiles se calculan correctamente
- [ ] El historial muestra todos los exámenes pasados

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/api/stats/route.ts`
- `src/app/api/stats/subjects/[id]/route.ts`
- `src/app/api/exams/history/route.ts`
- `src/lib/stats/calculator.ts`

**Estimated scope:** Medium (4 files)

---

### Task 15: Dashboard con estadísticas y áreas de mejora
**Description:** Crear la página principal (Dashboard) con visualización de estadísticas, progreso de estudio, materias con sus avances, exámenes recientes, y áreas que necesitan más práctica.

**Acceptance criteria:**
- [ ] Cards de resumen: total materiales, exámenes completados, puntaje promedio
- [ ] Lista de materias con indicador de progreso (barra de avance)
- [ ] Exámenes recientes con puntajes
- [ ] Sección "Áreas de mejora" con temas/conceptos que necesitan práctica
- [ ] Quick actions: subir material, generar examen, estudiar materia
- [ ] Diseño minimalista: sin gradientes, colores planos, tipografía limpia

**Verification:**
- [ ] Dashboard carga con datos reales de la DB
- [ ] Las estadísticas se actualizan al completar exámenes
- [ ] Quick actions navegan a las páginas correctas
- [ ] Responsive y se ve bien en mobile

**Dependencies:** Task 14

**Files likely touched:**
- `src/app/page.tsx` (Dashboard)
- `src/components/dashboard/stats-cards.tsx`
- `src/components/dashboard/subject-progress.tsx`
- `src/components/dashboard/recent-exams.tsx`
- `src/components/dashboard/improvement-areas.tsx`

**Estimated scope:** Medium (5 files)

---

## ✅ Checkpoint: Completo
- [ ] Flujo completo: subir material → resumir → explicar → examinar → ver progreso
- [ ] Dashboard muestra estadísticas reales
- [ ] Todos los tipos de examen funcionan con evaluación
- [ ] La app es responsive y tiene dark mode
- [ ] `npm run build` sin errores
- [ ] Revisión final antes de poner en uso
