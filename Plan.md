t# Definición del proyecto

# Objetivo

Construir una plataforma para restaurantes que combine tres cosas: monitoreo de mesas con video e IA, un sistema de gestión para el personal, y una web pública donde los clientes consultan disponibilidad,reservan y cada restaurante puede personalizar su perfil que el usuario ve.

# Alcance de la demo

Para una demo funcional, sin pretender operar en producción con varios locales reales:

Un restaurante de demostración con mesas, meseros y menú cargados.
Varios restaurantes ficticios en el directorio público, para que la lista se vea real.
Video de una cámara grabada o simulada, en lugar de cámaras instaladas.
Pagos, impresión de comandas y facturación fuera de alcance.

# Plan de desarrollo por área

Cada área tiene una rama desarrollando su funcionalidad con su propio Codex y Antigravity se encargará de coordinar todo en el main.

## Estructura del repositorio

Un monorepo para que Codex y Antigravity trabajen sobre la misma base:

```
restaurante-plataforma/
├── contracts/            # Owner: Manuel. Contratos compartidos
│   ├── openapi.yaml      # API REST
│   ├── events.schema.json  # Eventos de video y de pedidos
│   └── README.md
├── services/
│   ├── api/              # Owner: Manuel. Backend + BD + auth
│   └── vision/           # Owner: Manuel. Análisis de video
├── apps/
│   ├── gestion/          # Owner: Brandon. PWA del restaurante
│   └── publica/          # Owner: Angel y Luis. Web pública
└── docs/                 # Decisiones de arquitectura
```

**Regla central:** cada Codex solo modifica su carpeta. Lo que cruza fronteras pasa por `contracts/`, y ese archivo solo lo cambia Manuel, previo aviso al resto.

## Tecnologías por área

**Área 1: Video, backend y BD (Manuel)**
- Visión: Python, OpenCV, un detector de personas preentrenado (YOLO vía Ultralytics), tracking con ByteTrack (librería `supervision`), reglas de zona con Shapely. SAM y DINO solo como mejora opcional.
- API: FastAPI con Pydantic. Documentación OpenAPI generada automáticamente.
- BD: PostgreSQL en Neon, migraciones con Alembic, SQLAlchemy como ORM.
- Tiempo real: WebSockets para alertas a la PWA.
- Auth: JWT con roles (`platform_admin`, `gerente`, `mesero`, `cocina`) y aislamiento por `restaurant_id`.
- Despliegue: API en Render o Railway; servicio de visión en una computadora local del restaurante (o en tu laptop para la demo).

**Área 2: Sistema de gestión (Brandon)**
- Next.js con React y TypeScript.
- Tailwind CSS y shadcn/ui para componentes.
- PWA con Serwist (instalable, con caché offline para el plano de mesas).
- TanStack Query para datos del servidor y Zustand para estado local.
- Cliente WebSocket para alertas en vivo.
- Cliente de API generado desde `contracts/openapi.yaml`.

**Áreas 3 y 4: Web pública (Angel y Luis)**
- Next.js con renderizado en servidor (SSR) para que Google indexe el directorio.
- Tailwind CSS y shadcn/ui, compartiendo el sistema de diseño con la PWA.
- Búsqueda y filtros por ciudad, tipo de cocina y número de personas.
- Correos de confirmación con Resend.
- Cliente de API generado desde `contracts/openapi.yaml`.

## Transversalidad por área

Cada área se responsabiliza de lo siguiente dentro de su sección:

| Tema | Manuel | Brandon | Angel y Luis |
|---|---|---|---|
| Seguridad | Auth, roles, validación en API, secretos | Protección de rutas, sesión segura | Protección de formularios, rate limiting de reservas, sin datos sensibles expuestos |
| Pruebas | Unitarias de reglas de atención y API | Pruebas de componentes y de flujos clave | Pruebas de búsqueda y de reserva |
| Privacidad | No guardar video, retención de eventos | No mostrar datos de clientes innecesarios | Consentimiento en formulario de reserva |
| Documentación | README y contratos | README y guía de uso | README y guía de contenido |
| Observabilidad | Logs y métricas de visión | Errores de cliente | Errores y analítica básica |

## Contratos compartidos

Lo que hay que definir antes de la semana 2 para que las áreas no se bloqueen:

- **Endpoints de reservas:** disponibilidad, crear, cancelar, consultar.
- **Endpoints de pedidos y mesas:** estado de mesa, crear pedido, cambiar estado.
- **Evento de mesa desatendida:** `mesa_id`, `restaurant_id`, `desde`, `duracion_seg`, `severidad`.
- **Restaurantes públicos:** nombre, ubicación, tipo de cocina, horarios.
- **Errores:** formato único para todas las respuestas de error.

## Checklists de funcionalidades

### Área 1: Video, backend y BD (Manuel)

**Visión**
- [ ] Captura de video desde archivo o cámara IP
- [ ] Calibración de zonas por mesa (polígonos guardados por restaurante)
- [ ] Detección de personas y tracking entre cuadros
- [ ] Identificación de meseros
- [ ] Regla de mesa desatendida con umbral configurable
- [ ] Envío de eventos a la API
- [ ] Modo demo con video grabado

**Backend**
- [ ] Autenticación y roles
- [ ] CRUD de restaurantes, mesas, zonas, productos y menú
- [ ] Pedidos y cambios de estado
- [ ] Reservas: disponibilidad, crear, cancelar, marcar llegada
- [ ] Endpoints públicos de directorio y disponibilidad
- [ ] WebSockets para alertas
- [ ] Reportes básicos de ocupación y tiempos

**BD y transversal**
- [ ] Esquema con `restaurant_id` en todas las tablas
- [ ] Migraciones versionadas
- [ ] Datos semilla para la demo
- [ ] Pruebas de reglas de atención
- [ ] Despliegue de la API y de la BD en Neon

### Área 2: Sistema de gestión PWA (Brandon)

- [ ] Login y redirección por rol
- [ ] Plano de mesas con estado en vivo (libre, ocupada, pidió, cuenta, sin atender)
- [ ] Alertas de mesa desatendida con sonido y vibración
- [ ] Toma de pedidos por mesa
- [ ] Vista de cocina con comandas
- [ ] Reservas internas: lista del día, confirmar, cancelar, marcar llegada
- [ ] Reportes básicos de ocupación
- [ ] PWA instalable con modo offline del plano de mesas
- [ ] Diseño responsivo para tablet y celular
- [ ] Pruebas de flujos principales

### Áreas 3 y 4: Web pública (Angel y Luis)

- [ ] Página de inicio y búsqueda
- [ ] Directorio de restaurantes con filtros
- [ ] Página de cada restaurante con información y menú
- [ ] Disponibilidad por fecha, hora y número de personas
- [ ] Flujo de reserva en una mesa libre
- [ ] Confirmación por correo
- [ ] Registro e inicio de sesión opcional para ver reservas
- [ ] SEO: metadatos, sitemap y datos estructurados por restaurante
- [ ] Pruebas de búsqueda y reserva

## Cronograma sugerido (12 a 14 semanas)

- **Semana 1:** repositorio, contratos, esquema de BD y diseño de pantallas.
- **Semanas 2 a 4:** API con autenticación, CRUD base, plano de mesas en PWA y directorio en web pública.
- **Semanas 5 a 8:** pedidos, reservas, detección de video y alertas en vivo.
- **Semanas 9 a 11:** integración de los tres frentes, flujos completos y pruebas.
- **Semanas 12 a 14:** datos de demo, ajustes, documentación y presentación.

**Hito de integración:** semana 6. A partir de aquí, cada área prueba contra la API real y no contra mocks.

---

## README para Codex: Área 1 (Manuel), `services/` y `contracts/`

```markdown
# Área 1: Video, API y Base de Datos

## Responsable
Manuel. Eres el único dueño de `services/api/`, `services/vision/` y `contracts/`.

## Objetivo
Construir el servicio de análisis de video que detecta mesas desatendidas, la API REST que usan todas las apps y el esquema de base de datos en Neon.

## Alcance
- `services/vision/`: detección de personas, tracking, zonas por mesa y reglas de atención.
- `services/api/`: FastAPI, autenticación, roles, reservas, pedidos, mesas, directorio público, WebSockets.
- `services/api/migrations/`: migraciones con Alembic.
- `contracts/`: OpenAPI y esquemas de eventos.

## Stack
- Python 3.12, FastAPI, Pydantic, SQLAlchemy, Alembic
- PostgreSQL
- OpenCV, Ultralytics (YOLO), supervision (ByteTrack), Shapely
- pytest para pruebas

## Reglas para el agente
1. No modifiques `apps/`. Si una app necesita un cambio, documéntalo en `contracts/CHANGELOG.md`.
2. Todo endpoint debe existir en `contracts/openapi.yaml` antes de implementarse.
3. Toda tabla lleva `restaurant_id` y las consultas deben filtrar por él.
4. El video nunca se guarda ni se envía a la nube; solo se envían eventos.
5. Las contraseñas se guardan con hash. Nunca se escriben secretos en el código.
6. Cada regla de negocio nueva lleva pruebas.

## Checklist de terminado
- [ ] Autenticación con roles funcionando
- [ ] CRUD de restaurantes, mesas, zonas, productos
- [ ] Pedidos y reservas con sus endpoints
- [ ] Endpoints públicos de directorio y disponibilidad
- [ ] WebSockets para alertas
- [ ] Detección de mesa desatendida con umbral configurable
- [ ] Migraciones aplicadas en Neon
- [ ] Datos semilla para demo
- [ ] Pruebas pasando en CI

## Contratos que produce
- `contracts/openapi.yaml`
- `contracts/events.schema.json`

## Definición de "hecho"
Un endpoint está hecho cuando tiene contrato, implementación, pruebas y migración si aplica.
```

## README para Codex: Área 2 (Brandon), `apps/gestion/`

```markdown
# Área 2: Sistema de Gestión (PWA)

## Responsable
Brandon. Eres el dueño de `apps/gestion/`.

## Objetivo
PWA instalable para gerentes, meseros y cocina, con plano de mesas en vivo, pedidos, reservas internas y alertas de mesas desatendidas.

## Alcance
- Login y rutas protegidas por rol
- Plano de mesas con estado en tiempo real
- Toma de pedidos y vista de cocina
- Reservas internas del día
- Alertas con sonido y vibración
- Modo offline del plano de mesas
- Diseño responsivo para tablet y celular

## Stack
- Next.js con TypeScript
- Tailwind CSS y shadcn/ui
- Serwist para PWA y caché offline
- TanStack Query y Zustand
- Cliente de API generado desde `contracts/openapi.yaml`
- Cliente WebSocket para alertas
- Vitest y Playwright para pruebas

## Reglas para el agente
1. Solo modifica `apps/gestion/`. No toques `services/` ni `apps/publica/`.
2. Consume la API únicamente a través del cliente generado desde `contracts/openapi.yaml`.
3. No inventes endpoints. Si falta uno, pídelo a Manuel en `contracts/CHANGELOG.md`.
4. Protege todas las rutas según el rol del usuario.
5. No muestres datos de clientes más allá de lo necesario para la operación.
6. Usa los componentes del sistema de diseño compartido en `apps/publica/` como referencia, sin importarlos directamente.

## Checklist de terminado
- [ ] Login y redirección por rol
- [ ] Plano de mesas con estados en vivo
- [ ] Alertas de mesa desatendida con sonido y vibración
- [ ] Toma de pedidos y vista de cocina
- [ ] Reservas internas: lista, confirmar, cancelar, marcar llegada
- [ ] Reportes básicos de ocupación
- [ ] PWA instalable
- [ ] Modo offline del plano de mesas
- [ ] Pruebas de flujos principales

## Contratos que consume
- `contracts/openapi.yaml`
- `contracts/events.schema.json`

## Definición de "hecho"
Una pantalla está hecha cuando funciona contra la API real en el hito de integración, es responsiva y tiene pruebas de su flujo principal.
```

## README para Codex: Áreas 3 y 4 (Angel y Luis), `apps/publica/`

```markdown
# Áreas 3 y 4: Web Pública

## Responsables
Angel y Luis. Son los dueños de `apps/publica/`. Dividan el trabajo así: Angel toma directorio, páginas de restaurante y SEO; Luis toma búsqueda, disponibilidad, reservas y cuentas de cliente.

## Objetivo
Sitio público donde cualquier persona descubre restaurantes, consulta disponibilidad y reserva una mesa libre.

## Alcance
- Inicio y búsqueda
- Directorio con filtros por ciudad, tipo de cocina y número de personas
- Página de cada restaurante con información y menú
- Disponibilidad por fecha, hora y personas
- Flujo de reserva y confirmación por correo
- Registro e inicio de sesión opcional para ver reservas
- SEO: metadatos, sitemap, datos estructurados

## Stack
- Next.js con TypeScript y renderizado en servidor
- Tailwind CSS y shadcn/ui
- Resend para correos
- TanStack Query para datos del cliente
- Cliente de API generado desde `contracts/openapi.yaml`
- Vitest y Playwright para pruebas

## Reglas para el agente
1. Solo modifica `apps/publica/`. No toques `services/` ni `apps/gestion/`.
2. Consume solo endpoints públicos o de cliente definidos en `contracts/openapi.yaml`.
3. Las páginas de restaurante deben renderizarse en servidor para que Google las indexe.
4. El formulario de reserva debe incluir aviso de privacidad y consentimiento.
5. Aplica límite de intentos en reservas y en inicio de sesión.
6. Nunca muestres en la web pública información interna del restaurante, como pedidos o estado de mesas en vivo.

## Checklist de terminado
- [ ] Inicio y búsqueda
- [ ] Directorio con filtros
- [ ] Página de restaurante con SEO
- [ ] Disponibilidad por fecha, hora y personas
- [ ] Flujo de reserva completo
- [ ] Confirmación por correo
- [ ] Registro e inicio de sesión opcional
- [ ] Sitemap y datos estructurados
- [ ] Pruebas de búsqueda y reserva

## Contratos que consume
- `contracts/openapi.yaml` (solo endpoints públicos y de cliente)

## Definición de "hecho"
Una página está hecha cuando se renderiza en servidor, funciona contra la API real y tiene pruebas de su flujo principal.
```

---

## Dos puntos a acordar antes de arrancar

1. **Quién decide sobre `contracts/`.** Propongo que Manuel sea el único que lo modifica, pero que Brandon, Angel y Luis puedan proponer cambios en `contracts/CHANGELOG.md`. Así evitan conflictos.
2. **Quién integra.** Propongo que Manuel coordine la integración en el hito de la semana 6, porque es el dueño del contrato y de la base de datos.
