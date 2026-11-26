# Web pública de restaurantes

Aplicación pública del monorepo con Next.js App Router, React, TypeScript estricto, Tailwind CSS y ESLint. La Fase 1.4 conecta el directorio y las fichas de las 14 rutas a servicios del servidor con datos ficticios locales.

## Instalación y ejecución

Usa Node.js 24 LTS y npm. La configuración se verificó con Node.js 24.19.0 y npm 11.17.0. El rango compatible se indica en `engines.node` de `package.json`.

Desde la raíz del repositorio:

```sh
cd apps/publica
npm install
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
| `page-builder` | Edición, vista previa y renderizado de páginas personalizadas. Incluye el contenido temporal del workspace y de la vista previa. |

### Convenciones de código y dependencias

- `app/` resuelve los parámetros de Next.js y compone las pantallas de `features/`. Las pantallas reciben los valores como props y usan Server Components por defecto.
- Coloca los componentes de un dominio en su módulo. Extrae a `components/` los elementos con reutilización real entre pantallas. Los componentes compartidos pueden importar configuración e infraestructura general y deben quedar libres de dependencias de `features/`.
- Coloca un adaptador de un dominio en `features/<módulo>/services/` cuando exista una integración concreta. Reserva `lib/` para infraestructura y utilidades transversales y `config/` para configuración compartida.
- Importa los archivos concretos y usa `@/*` para resolver desde `src/*` cuando facilite la lectura. Evita las dependencias circulares y los `index.ts` globales que reexportan módulos completos.
- Mantén el renderizador público libre de dependencias del editor. Las fichas públicas podrán componer el renderizador desde `app/`. Consulta los [límites de page-builder](src/features/page-builder/README.md).

Los directorios reservados contienen `.gitkeep` para que Git los incluya antes de incorporar su primera implementación. Las pantallas actuales son demostrativas. La consulta de disponibilidad real, las reservas, la autenticación, la persistencia y la edición visual siguen pendientes.

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

El tema, la composición y el contenido editorial pertenecen a la personalización. Los precios, la disponibilidad de productos y horarios reservables y las reglas de reservas pertenecen a la operación. Los bloques correspondientes deberán consultar datos autorizados del restaurante. Consulta los [requisitos del futuro PageDocument](src/features/page-builder/README.md#requisitos-del-futuro-pagedocument).

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

Las fichas se prerenderizan para el catálogo finito de la demo y su alias. Así Next.js puede responder HTTP 404 para un slug desconocido antes de iniciar el streaming. Al integrar un catálogo que cambie en tiempo de ejecución habrá que revisar `dynamicParams` en la ficha y verificar de nuevo el código HTTP 404. [Generación de parámetros estáticos en Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

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

Los enlaces internos usan `src/config/routes.ts`. El layout raíz comparte idioma y estilos. La plataforma, el restaurante, la autenticación y la cuenta tienen sus propias estructuras. En el editor, el grupo anidado `(workspace)` aplica el panel de herramientas a la pantalla de edición y deja la vista previa en una rama hermana.

Desde `/restaurantes` puedes abrir las fichas de `casa-oliva`, `raiz-norte` y `kumo`. `/restaurantes/restaurante-demo` sigue disponible como alias de Casa Oliva. También puedes probar `/restaurantes/restaurante-demo/reservar`, `/editor/demo-restaurant` y `/editor/demo-restaurant/preview`. Las rutas de cuenta y del editor, incluida la vista previa, requieren autenticación y autorización reales en el servidor antes de producción.

## Responsabilidades

Angel y Luis mantienen esta aplicación. Su alcance incluye el directorio, las fichas públicas, la búsqueda, la disponibilidad y el flujo de reserva. La gestión interna, la API y el análisis de video pertenecen a sus respectivos equipos.

La integración consumirá operaciones públicas o de cliente definidas en `contracts/openapi.yaml` cuando el responsable de backend publique el contrato. Las responsabilidades del monorepo se describen en [Plan.md](../../Plan.md).
