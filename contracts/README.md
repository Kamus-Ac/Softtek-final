# Contratos compartidos — v0.1.0

Responsable: Manuel. Consumidores: PWA de Brandon, web pública de Angel y Luis,
API y servicio local de visión. Este directorio define interfaces; todavía no
implementa endpoints, almacenamiento, autenticación ni procesamiento de video.

## Archivos y validación

- `openapi.yaml`: OpenAPI 3.1, API REST bajo `/api/v1`.
- `events.schema.json`: JSON Schema 2020-12 de mensajes WebSocket y eventos de visión.
- `examples/events.json`: ejemplos válidos de cada tipo de evento.
- `build_contracts.py`: fuente que genera ambos contratos, evitando divergencia.
- `test_contracts.py`: valida OpenAPI, referencias, ejemplos, permisos y restricciones.
- `CHANGELOG.md`: cambios y lugar para propuestas de los demás frentes.

Desde la raíz del repositorio, en PowerShell (Python 3.12 o superior):

```powershell
python -m venv contracts/.venv
contracts/.venv/Scripts/python.exe -m pip install -r contracts/requirements-dev.txt
contracts/.venv/Scripts/python.exe contracts/build_contracts.py
contracts/.venv/Scripts/python.exe -m unittest discover -s contracts -p "test_*.py" -v
```

Editar el generador y regenerar; subir también los dos contratos generados.
Los consumidores pueden generar sus clientes TypeScript desde `openapi.yaml`.
Cada `operationId` es único y estable. No inventar rutas fuera del contrato.
Los valores de `x-roles` documentan permisos que la API deberá comprobar;
OpenAPI por sí mismo no aplica autorización.

## Flujo de ramas para Antigravity

- `codex/feat-contracts`: esta entrega, solo `contracts/`.
- `codex/feat-live-video`: trabajo posterior en `services/vision/`.
- `codex/feat-database`: trabajo posterior de modelos y migraciones en `services/api/`.

Las dos ramas futuras parten del commit inicial de contratos. Antigravity debe
integrar primero contratos a `main`; después integrar cada feature validada.
No duplicar la implementación de BD en video ni implementar endpoints desde la
rama de contratos. Para cada feature posterior, crear una rama nueva desde un
`main` actualizado. No reescribir ramas compartidas con force push.

Los cambios incompatibles requieren aviso y coordinación con los consumidores,
una entrada en el changelog y, cuando corresponda, nueva versión mayor de API o
de eventos. El aviso al equipo lo realiza el responsable al publicar esta rama.

## Convenciones

- Rutas y propiedades REST en inglés con `snake_case`; estados y roles según el plan.
- Eventos conservan `mesa_id`, `desde`, `duracion_seg`, `severidad` del plan.
  `restaurant_id` va en el sobre común.
- IDs UUID; timestamps RFC 3339 con zona explícita. La API responde en UTC.
  Fechas de consulta y horarios semanales se interpretan en la zona IANA del restaurante.
- `day`: lunes=0, domingo=6. Cada intervalo cumple `opens < closes`;
  un horario nocturno se divide en dos días. Sin intervalos significa cerrado.
- Cantidades monetarias enteras en unidad menor (`price_minor`): 12950 = MXN 129.50.
  La demo usa MXN. La moneda del restaurante es configuración de servidor.
- Listas internas/públicas: `items`, `total`, `limit` (1–100; por defecto 20),
  `offset` (por defecto 0); orden estable por ID salvo reservas/pedidos por fecha e ID.
- PATCH omite campos sin cambio; no admite objetos vacíos ni valores null salvo
  donde el esquema lo declare. El servidor valida reglas cruzadas adicionales.
- DELETE realiza baja lógica para conservar históricos; los recursos inactivos
  no se pueden asignar a nuevas operaciones. 204 sin cuerpo.
- Los errores usan `{code, message, request_id, details?}` incluso para validación
  de FastAPI. Códigos de negocio sugeridos: `validation_error`, `unauthorized`,
  `forbidden`, `not_found`, `invalid_transition`, `no_availability`,
  `idempotency_conflict`, `rate_limited`, `internal_error`.

## Autenticación y aislamiento

`POST /auth/login` recibe email, contraseña y restaurante seleccionado.
Devuelve un JWT corto y el usuario; renovar sesión mediante login en esta versión.
La API valida firma, expiración, emisor y audiencia. Credenciales inválidas deben
producir el mismo error genérico y aplicar límite de intentos.

El restaurante de la ruta debe coincidir con la membresía y el claim
`restaurant_id`. No confiar en IDs enviados por el cliente: tablas, productos,
pedidos, reservas y zonas referenciadas deben pertenecer al mismo restaurante.
Usar 404 para IDs ajenos; 403 para rol insuficiente en el restaurante autorizado.
Los usuarios normales pertenecen a un restaurante; `platform_admin` puede tener
`restaurant_id=null` y seleccionar un restaurante explícito en la ruta.
La creación del primer administrador y credenciales de dispositivos será un
procedimiento de aprovisionamiento fuera de la API pública.

La BD llevará `restaurant_id` en entidades del restaurante. Excepciones necesarias:
la entidad raíz `restaurants` se identifica por su propio `id`; un administrador
global puede no pertenecer a un restaurante. Relaciones y claves compuestas deben
impedir referencias entre restaurantes incluso si un filtro de API falla.

Gerente administra usuarios locales, mesas, zonas y productos; nunca puede crear
un administrador global. No se permite desactivar al último gerente activo.
Cocina consulta mesas, menú y pedidos; no accede a huéspedes, usuarios ni reportes.

## Mesas y pedidos

`state` de mesa: `libre`, `ocupada`, `pidio`, `cuenta`. `unattended` es una alerta
independiente: la PWA puede mostrar “sin atender” sin perder el estado operativo.
La mesa pasa de libre a ocupada por acción de personal o llegada de una reserva;
un pedido aceptado la pasa a `pidio`. `cuenta` la solicita personal y liberar mesa
requiere que no queden pedidos activos. Repetir el estado actual es idempotente.
La detección de personas no libera ni reasigna mesas automáticamente.

Pedidos: `pendiente → en_preparacion → lista → servida`.
Gerente y administrador pueden avanzar o cancelar antes de `servida`.
Mesero puede crear, cancelar `pendiente` y avanzar `lista → servida`.
Cocina solo puede avanzar `pendiente → en_preparacion → lista`.
Los estados `servida` y `cancelada` son terminales. Repetir el estado actual no
duplica eventos. Un cambio inválido devuelve 409; permiso insuficiente, 403.
La API fija precios desde productos disponibles y conserva nombre y precio del
momento; no acepta totales calculados por el frontend.

Zonas: coordenadas normalizadas [0,1] relativas al cuadro; polígono simple de al
menos tres vértices distintos, sin repetir el primero. El servidor valida área
positiva, ausencia de cruces, pertenencia de mesa y cámara, y unicidad por mesa y
cámara. No se publican direcciones IP, RTSP ni credenciales de cámaras.

## Disponibilidad y reservas

Consultar `date` y `party_size` devuelve intervalos con cantidad de mesas
disponibles, sin IDs ni estado operativo público de las mesas. `party_size` en
el directorio solo filtra capacidad. Perfil, menú, disponibilidad y reservas
públicas de un restaurante sin publicar responden 404.

La API genera slots cada 15 minutos dentro del horario; duración por restaurante
(predeterminada 90 minutos), sin combinar mesas en esta versión. `starts_at` debe
ser futuro, coincidir con un slot y caber completo en el horario. Para hoy se
descartan slots pasados. Ventana máxima de consulta/reserva: 90 días locales.
Reservas `pendiente` y `confirmada` bloquean el intervalo `[starts_at, ends_at)`;
`llego` conserva el bloqueo hasta `ends_at`. Mesas inactivas no participan.
Ocupación operativa actual también impide asignar una mesa a un slot que incluya
el momento actual. Una reserva futura no garantiza que el cliente anterior libere
puntualmente la mesa; el personal debe gestionar esas situaciones.

Crear reserva asigna de forma atómica la mesa activa más pequeña suficiente
(desempate por ID); el frontend público no selecciona una mesa. Reserva interna
puede proponer `table_id`, sujeto a las mismas verificaciones. El servidor calcula
`ends_at`; no confiar en la disponibilidad consultada anteriormente. Conflicto de
capacidad o solapamiento devuelve 409, incluso con solicitudes concurrentes.

La reserva se crea `confirmada`. Se conserva `pendiente` para reservas pendientes
de confirmación del personal, sin expiración automática en esta versión.
Transiciones: `pendiente → confirmada|cancelada`,
`confirmada → llego|cancelada|no_asistio`. `llego`, `cancelada` y `no_asistio` son
terminales. Marcar llegada requiere mesa libre y asignada, y la ocupa en la misma
transacción. `no_asistio` solo se permite después de `starts_at`. Repetir estado
no genera otro evento. El público solo puede cancelar pendiente o confirmada.

La creación pública exige consentimiento explícito y versión del aviso.
`Idempotency-Key` es obligatoria: clave aleatoria de 16–128 caracteres por intento;
durante 24 horas la misma clave y cuerpo devuelven el mismo 201 y token; cuerpo
distinto, 409. Ámbito: restaurante + operación + clave. Proteger el resultado
almacenado con el token para permitir reintentos sin guardar secretos en texto plano.
Rate limiting se aplica en API, además de cualquier protección del frontend.
429 devuelve `Retry-After`; umbrales configurables por despliegue.

El token de gestión opaco (al menos 256 bits aleatorios) se entrega una sola vez
en la creación, salvo replay idempotente, y se usa como
`Authorization: Bearer <management_token>` para consultar o cancelar esa reserva.
Nunca basta conocer el UUID. No ponerlo en URLs ni logs. Consulta pública no
devuelve nombre, email ni teléfono. Respuestas privadas usan `Cache-Control: no-store`.
El token expira como máximo 24 horas después de `ends_at`.
La confirmación por correo corresponde a la integración con Resend; este contrato
no promete que el correo se haya enviado al devolver 201. Cuentas de clientes son
opcionales y quedan para otro contrato; las reservas funcionan como invitado.

## Visión y tiempo real

1. El dispositivo local consulta `GET /restaurants/{restaurant_id}/vision/config`
   con su credencial `VisionBearer`; recibe zonas y umbral, nunca un stream.
2. Procesa video localmente y emite `mesa.desatendida` al cruzar el umbral,
   `mesa.atendida` al detectar atención posterior. `desde` indica el inicio del
   periodo sin atención y `duracion_seg` su duración. `occurred_at` es el momento
   de detección; los relojes deben estar sincronizados.
3. Envía un evento por POST a `/restaurants/{restaurant_id}/vision/events`.
   La API verifica pertenencia de mesa y dispositivo, `desde <= occurred_at` y
   consistencia de duración (tolerancia de 2 segundos). Clasificación inicial:
   advertencia al umbral; crítica a partir del doble del umbral.
4. La API deduplica por `event_id` persistido. Un reintento idéntico devuelve
   202 y `duplicate=true`; no repite alertas. El dispositivo conserva el ID al
   reintentar. Mismo ID con distinto cuerpo devuelve 409.
5. La API actualiza `unattended` y publica el evento validado a la PWA; para una
   misma mesa, un evento anterior al último aplicado no revierte su estado.

Envelope común: `event_id`, `schema_version`, `type`, `restaurant_id`,
`occurred_at`, `source`, `data`. Solo `source=vision` y los dos tipos de atención
pueden ingresar desde un dispositivo. Los demás eventos los produce la API.
No se guardan ni se suben cuadros, video, embeddings ni identificadores personales
de tracking. La retención de metadatos será configurable (demo: 7 días).

### WebSocket (fuera de OpenAPI REST)

- Obtener ticket mediante `POST /restaurants/{restaurant_id}/ws-ticket` con JWT.
- Conectar a `ws://localhost:8000/api/v1/restaurants/{restaurant_id}/ws?ticket=...`;
  en despliegue usar HTTPS/WSS. El ticket aleatorio es de un solo uso, ligado a
  usuario y restaurante, válido como máximo 60 segundos. No usar JWT en la URL.
- El handshake valida ticket, membresía y Origin permitido. Tickets en query
  deben redactarse de logs. Expiración de sesión/desactivación cierra la conexión.
- Cada frame de texto contiene un objeto válido de `events.schema.json`.
  Solo eventos del restaurante autorizado; no incluir datos personales de reservas.
- No se garantiza entrega ni orden global; deduplicar por `event_id` y descartar
  por recurso eventos anteriores al último `occurred_at` aplicado.
  La API usa su reloj para eventos operativos. Ante desconexión, el cliente
  marca datos como desactualizados, reconecta con ticket nuevo y vuelve a consultar
  mesas, pedidos y reservas por REST. No hay replay persistente en esta versión.
- Cierre: 1008 por credencial inválida o permisos; 1011 por fallo del servidor.
  El servidor puede usar frames ping/pong del protocolo para detectar desconexiones.

## Reportes

`from < to`, periodo máximo de 31 días. `total_tables`, `occupied_tables` y
`occupancy_ratio` representan la foto actual de mesas activas (con cero mesas,
ratio=0). `unattended_events` cuenta IDs únicos `mesa.desatendida` del periodo
`[from,to)`; `average_unattended_seconds` promedia la duración de eventos
`mesa.atendida` del mismo periodo y es null si no hay ninguno.
No se presenta como ocupación histórica: requerirá un contrato adicional.
