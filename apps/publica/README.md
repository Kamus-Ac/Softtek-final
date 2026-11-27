# Web pública de restaurantes

Aplicación pública del monorepo con 14 patrones de ruta. El directorio y las fichas consumen servicios de servidor con datos ficticios locales. La compilación de producción sirve para demostración técnica.

| Fase | Entrega |
| --- | --- |
| 0 | Inicialización, scripts y configuración. |
| 1.1 | Rutas, layouts y navegación. |
| 1.2 | Módulos por funcionalidad y estructura de Page Builder. |
| 1.3 | Modelos internos de dominio. |
| 1.4 | Datos ficticios, adaptadores de servicios y fichas de demostración. |
| 1.5 | Auditoría, aislamiento de resultados de servicios y pruebas reproducibles. |
| 1.6.1 | Prueba de concepto del editor visual con GrapesJS Core. |
| 1.6.2 | Biblioteca de 13 bloques, composiciones responsivas y widget experimental de menú. |
| 1.6.3.A | Proyecto editable y documento V1 normalizado con diagnóstico y recarga en memoria. |
| 1.6.3.B | Widgets experimentales para horarios, ubicación, contacto, disponibilidad y reservaciones. |

## Instalación y ejecución

Usa Node.js 24 LTS y npm. La configuración se verificó con Node.js 24.19.0 y npm 11.17.0. El rango compatible se indica en `engines.node` de `package.json`.

| Tecnología | Versión instalada |
| --- | --- |
| Next.js con App Router / `eslint-config-next` | 16.4.6 |
| React / React DOM | 19.3.1 |
| TypeScript estricto | 5.9.3 |
| Tailwind CSS / `@tailwindcss/postcss` | 4.3.5 |
| PostCSS | 8.5.33 |
| ESLint | 9.39.5 |
| GrapesJS Core | 0.23.9 (BSD-3-Clause) |

ESLint 9 llegó al fin de soporte. La migración queda pendiente de verificar compatibilidad de `eslint-config-next` y sus plugins con ESLint 10. [Soporte de versiones de ESLint](https://eslint.org/version-support/)

Desde la raíz del repositorio:

```sh
cd apps/publica
npm ci
npm run dev
```

Abre http://localhost:3000. La página inicial funciona sin variables de entorno. Usa `.env.example` para documentar las variables que se incorporen y guarda tus valores locales en `.env.local`.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm run start` | Sirve la compilación de producción después de `npm run build`. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run typecheck` | Genera los tipos de rutas y comprueba TypeScript sin emitir JavaScript. |

### Validación

Desde `apps/publica`, con Node.js 24:

```sh
npm run lint
npm run typecheck
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/mock-services.test.mjs tests/page-document.test.mjs
npm run build
```

Las pruebas usan el ejecutor nativo de Node.js y comprueban integridad de datos, filtros, paginación, aislamiento de resultados y disponibilidad. Para una comprobación HTTP de producción ejecuta `npm run start -- --port 3100` si ese puerto está libre. Visita el directorio, las tres fichas, el alias, las rutas de reserva y las dos vistas del editor. Comprueba también el código HTTP, además del contenido, en `/restaurantes/no-existe` y en una URL inexistente fuera del catálogo.

### Editor visual experimental

Abre [/editor/demo-restaurant](http://localhost:3000/editor/demo-restaurant) con el servidor de desarrollo activo. **Bloques** reúne 18 elementos. En **Restaurante** encontrarás la portada, el menú dinámico, los horarios comerciales, la ubicación, el contacto, la disponibilidad y las reservaciones. **Ajustes** edita las opciones de presentación y **Estilos** controla el aspecto por dispositivo. Los datos de Casa Oliva provienen de los servicios de demostración.

En **Diagnóstico del documento**, **Validar documento** muestra el JSON V1 derivado y **Recargar en memoria** reconstruye los widgets a partir del contexto público. V1 admite los cinco tipos nuevos y conserva el formato de los bloques anteriores. La disponibilidad muestra dos consultas fijas y el botón de reservaciones está deshabilitado en el lienzo. Quedan pendientes el flujo real de reserva, el renderizado público, la persistencia, la publicación y la autorización en servidor. Consulta la [documentación de page-builder](src/features/page-builder/README.md).

## Arquitectura modular

```text
src/
├── app/
│   ├── (public)/
│   ├── (restaurant)/
│   ├── (auth)/
│   ├── (account)/
│   ├── (booking)/
│   └── (editor)/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── shared/
│   └── feedback/
├── features/
│   ├── home/components/
│   ├── discovery/       # components/ y types/
│   ├── restaurants/     # components/, services/ y types/
│   ├── availability/    # services/ y types/
│   ├── reservations/    # components/ y types/
│   ├── auth/components/
│   ├── account/         # components/ y types/
│   └── page-builder/
│       ├── blocks/
│       ├── editor/
│       ├── renderer/
│       ├── registry/
│       ├── schemas/
│       ├── theme/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
├── config/
├── hooks/
├── lib/
├── mocks/
├── styles/
└── types/
```

| Ruta | Contenido |
| --- | --- |
| `src/app/` | Rutas, layouts, metadatos, parámetros y composición de pantallas. Incluye las páginas informativas y los estados que App Router resuelve por convención. |
| `src/components/` | Layouts de navegación y componentes reutilizables. `ui/` se reserva para elementos base, `shared/` para composiciones reutilizadas y `feedback/` para estados compartidos. |
| `src/features/` | Pantallas, lógica e integraciones específicas de cada funcionalidad. |
| `src/lib/` | Infraestructura y utilidades generales que pueden usar varias funcionalidades. |
| `src/hooks/` | Hooks reutilizables de React. |
| `src/types/` | Tipos compartidos de la aplicación. |
| `src/config/` | Configuración transversal, incluidas las rutas estáticas y los generadores de rutas dinámicas. |
| `src/styles/` | Hoja global y entrada de Tailwind CSS. |
| `src/mocks/` | Restaurantes, menús, horarios y escenarios de disponibilidad ficticios para desarrollo y pruebas. |
| `public/images/`, `public/icons/`, `public/fonts/` | Recursos estáticos. |

### Responsabilidades por funcionalidad

| Módulo | Responsabilidad en la aplicación |
| --- | --- |
| `home` | Pantalla inicial y entrada al directorio. |
| `discovery` | Directorio y tipos de filtros. El listado básico muestra los restaurantes del servicio. |
| `restaurants` | Fichas públicas y acceso a restaurantes y menús mediante un servicio. |
| `availability` | Modelos y consulta simulada por restaurante, fecha y número de personas. |
| `reservations` | Flujo de reserva y confirmación. Incluye ambas pantallas temporales. |
| `auth` | Acceso y registro de clientes. Incluye las pantallas temporales de inicio de sesión y registro. |
| `account` | Perfil y consulta del historial de reservas del cliente. Incluye ambas pantallas temporales. |
| `page-builder` | Editor visual experimental y presentación provisional de la vista previa. |

### Convenciones de código y dependencias

- `app/` resuelve los parámetros de Next.js y compone las pantallas de `features/`. Las pantallas reciben los valores como props y usan Server Components por defecto.
- Coloca los componentes de un dominio en su módulo. Extrae a `components/` los elementos con reutilización real entre pantallas. Los componentes compartidos pueden importar configuración e infraestructura general y deben quedar libres de dependencias de `features/`.
- Coloca un adaptador de un dominio en `features/<módulo>/services/` cuando exista una integración concreta. Reserva `lib/` para infraestructura y utilidades transversales y `config/` para configuración compartida.
- Importa los archivos concretos y usa `@/*` para resolver desde `src/*` cuando facilite la lectura. Evita las dependencias circulares y los `index.ts` globales que reexportan módulos completos.
- Mantén el renderizador público libre de dependencias del editor. Las fichas públicas podrán componer el renderizador desde `app/`. Consulta los [límites de page-builder](src/features/page-builder/README.md).

Los directorios reservados contienen `.gitkeep` para que Git los incluya antes de incorporar su primera implementación. Las pantallas actuales son demostrativas. La consulta de disponibilidad real, las reservas, la autenticación y la persistencia siguen pendientes.

## Modelos de dominio

| Ubicación | Responsabilidad |
| --- | --- |
| `features/restaurants/types/` | Resumen para el directorio, ficha, ubicación, contacto público, cocinas, imágenes, horarios comerciales y menú. |
| `features/discovery/types/` | Filtros de búsqueda y paginación opcional. |
| `features/availability/types/` | Consulta por restaurante, fecha y número de personas, horarios reservables y resultado. |
| `features/reservations/types/` | Solicitud, contacto de reserva y registro con su estado para invitados o clientes registrados. |
| `features/account/types/` | Identidad y datos de contacto básicos del perfil del cliente. |
| `src/types/date-time.ts` | Convenciones de instante y zona horaria compartidas entre funcionalidades. |

Los modelos son internos y provisionales. Los DTO se definirán a partir del contrato oficial cuando backend lo publique. Los adaptadores de cada funcionalidad realizarán la validación y conversión en la frontera con la API. Esta fase describe tipos estáticos.

### Convenciones de tipado

- **Identificadores**. Se usan cadenas opacas cuya estructura interna no se interpreta. El `slug` es un valor de navegación separado del identificador del restaurante.
- **Fechas y horas**. La fecha de consulta es `YYYY-MM-DD` en la zona del restaurante. El horario comercial usa horas locales `HH:mm` de 24 horas. Cada día identifica si está cerrado o contiene uno o más intervalos. `closesNextDay` permite representar cierres después de medianoche. Los horarios reservables y las reservas usan instantes serializables RFC 3339 con desplazamiento UTC explícito o `Z`. [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6)
- **Zona horaria**. La ficha y el resultado de disponibilidad indican un identificador IANA, como `America/Mexico_City`. La ficha aporta el contexto del horario comercial y el resultado de disponibilidad conserva la zona incluso para una lista vacía. [Base de zonas horarias IANA](https://www.iana.org/time-zones)
- **Importes**. El precio del menú usa un entero seguro no negativo en unidades monetarias menores y un código alfabético ISO 4217. La escala depende de la moneda. Por ejemplo, `12500` con `MXN` representa 125 pesos. [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html)
- **Opcionales**. Se omiten los campos que no apliquen o cuyo valor aún no esté disponible. Una lista presente y vacía expresa ausencia de elementos. Por ejemplo, `slots: []` indica que la consulta no devuelve horarios. La paginación provisional usa páginas numeradas desde 1.

### Datos operativos y personalización

Los horarios comerciales describen la apertura habitual. La disponibilidad de reservas corresponde a una fecha y un tamaño de grupo y siempre se confirma con backend. Una solicitud contiene el horario elegido y el contacto necesario. Una reserva confirmada exige una referencia. Los estados de reserva provisionales son `pending`, `confirmed` y `cancelled`. La identidad de una cuenta autenticada deberá provenir de backend.

El tema, la composición y el contenido editorial pertenecen a la personalización. Los precios, la disponibilidad de productos y horarios reservables y las reglas de reservas pertenecen a la operación. Los bloques correspondientes deberán consultar datos autorizados del restaurante. Consulta el [modelo experimental de PageDocument](src/features/page-builder/README.md#proyecto-editable-y-documento-v1).

### Decisiones pendientes con backend

- Acordar formato de identificadores y slugs, catálogo de cocinas, campos públicos de ubicación y contacto, y modalidad de paginación.
- Acordar publicación de horarios comerciales, formato de fechas y zonas, y cómo se identifica un horario reservable al solicitar una reserva.
- Confirmar monedas, unidades menores, estado público de productos y orden del menú.
- Acordar estados y transiciones de reserva, emisión de referencias, datos mínimos de contacto e identidad de invitados y clientes registrados.

## Servicios y origen de datos

| Interfaz | Operaciones asíncronas |
| --- | --- |
| `RestaurantService` | `list(filters?)`, `getBySlug(slug)` y `getMenu(restaurantId)`. |
| `AvailabilityService` | `getAvailability({ restaurantId, date, partySize })`. |

`src/lib/data-services.ts` selecciona los adaptadores del servidor. Durante esta fase ambos usan las fuentes locales de `src/mocks/`, también al ejecutar una compilación local de producción. Antes de publicar la plataforma real, se sustituirán ambos adaptadores en ese archivo, se retirará el alias de demostración y se verificará que el despliegue use el contrato autorizado. Las rutas seguirán consumiendo las mismas interfaces y cada adaptador convertirá los DTO del backend a modelos de dominio.

El layout compartido por ficha y reserva obtiene los slugs de `RestaurantService.list()` mediante `generateStaticParams` y añade el alias de `config/routes.ts`. Con `dynamicParams = false`, una ficha incluida después del build y su página de reserva quedan fuera de ese despliegue hasta volver a compilar. Así Next.js puede responder HTTP 404 para un slug desconocido antes de iniciar el streaming. Para un catálogo dinámico, hay que decidir con backend cuándo se resuelve un slug que no estaba en el build, cómo se invalidan las fichas y cómo se conserva el estado HTTP 404. Una pantalla 404 puede llegar con HTTP 200 si la respuesta ya empezó a transmitirse. [Generación de parámetros estáticos](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) · [Streaming y códigos HTTP](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

La búsqueda de restaurantes compara el texto con el nombre y la descripción. Los filtros admiten coincidencia exacta por ciudad y cualquiera de las cocinas seleccionadas. Las comparaciones ignoran mayúsculas y acentos. La paginación empieza en 1, conserva el orden del conjunto de demostración y se aplica después de filtrar. El filtro `partySize` se reserva para una composición posterior: cuando el flujo capture una fecha, consultará disponibilidad para los candidatos y aplicará el criterio antes de paginar, o delegará la operación a backend si el contrato admite ese filtro.

Un listado sin coincidencias devuelve `[]`. Un restaurante desconocido devuelve `null` y la ficha pública lo transforma en un 404. Una consulta de disponibilidad válida sin horarios devuelve un resultado con `slots: []`. Las fechas o tamaños de grupo inválidos y la paginación inválida se rechazan con `RangeError`. Son convenciones internas de los adaptadores actuales.

Consulta los restaurantes, los casos de disponibilidad y los pasos de verificación en el [README de datos de demostración](src/mocks/README.md).

## Rutas y layouts

| Grupo | Rutas |
| --- | --- |
| `(public)` | `/`, `/restaurantes`, `/sobre-nosotros`, `/privacidad`, `/terminos` |
| `(restaurant)` | `/restaurantes/[slug]`, `/restaurantes/[slug]/reservar` |
| `(auth)` | `/login`, `/registro` |
| `(account)` | `/perfil`, `/mis-reservas` |
| `(booking)` | `/reservas/confirmacion` |
| `(editor)` | `/editor/[restaurantId]`, `/editor/[restaurantId]/preview` |

Los enlaces internos usan `src/config/routes.ts`. El layout raíz comparte idioma y estilos. La plataforma, el restaurante, la autenticación y la cuenta tienen sus propias estructuras. En el editor, el grupo anidado `(workspace)` aloja el editor visual y deja la vista previa en una rama hermana.

Desde `/restaurantes` puedes abrir las fichas de `casa-oliva`, `raiz-norte` y `kumo`. `/restaurantes/restaurante-demo` sigue disponible como alias de Casa Oliva. También puedes probar `/restaurantes/restaurante-demo/reservar`, `/editor/demo-restaurant` y `/editor/demo-restaurant/preview`. Las rutas de cuenta y del editor, incluida la vista previa, requieren autenticación y autorización reales en el servidor antes de producción.

## Límites de la demostración y preparación para publicar

- Las pantallas de reserva y confirmación son demostrativas. La reserva se abre para los mismos slugs que sus fichas y la futura implementación tendrá que confirmar disponibilidad y crear la reserva mediante backend.
- `/login` y `/registro` son pantallas informativas. `/perfil` y `/mis-reservas` requieren autenticación y autorización para consultar datos de una cuenta.
- El workspace y la vista previa necesitan autenticación, autorización en servidor y verificación de propiedad o permisos sobre el restaurante. La lectura de borradores y la publicación requieren permisos propios. El renderizador público consumirá contenido publicado.
- Antes de publicar, sustituye los adaptadores mock, retira el alias de demostración y valida los DTO recibidos de la API antes de convertirlos. Acuerda con backend el contrato de catálogo, disponibilidad y reservas, además de la política de visibilidad de fichas y borradores.

## Responsabilidades

Angel y Luis mantienen esta aplicación. Su alcance incluye el directorio, las fichas públicas, la búsqueda, la disponibilidad y el flujo de reserva. La gestión interna, la API y el análisis de video pertenecen a sus respectivos equipos.

La integración consumirá operaciones públicas o de cliente definidas en `contracts/openapi.yaml` cuando el responsable de backend publique el contrato. Las responsabilidades del monorepo se describen en [Plan.md](../../Plan.md).
