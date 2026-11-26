# Web pública de restaurantes

Aplicación pública del monorepo con Next.js App Router, React, TypeScript estricto, Tailwind CSS y ESLint. La Fase 1.2 organiza las pantallas temporales por funcionalidad y permite recorrer las 14 rutas de demostración.

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
│   ├── discovery/components/
│   ├── restaurants/components/
│   ├── availability/
│   ├── reservations/components/
│   ├── auth/components/
│   ├── account/components/
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
| `src/mocks/` | Espacio reservado para futuros datos de demostración en desarrollo y pruebas. |
| `public/images/`, `public/icons/`, `public/fonts/` | Recursos estáticos. |

### Responsabilidades por funcionalidad

| Módulo | Responsabilidad en la aplicación |
| --- | --- |
| `home` | Pantalla inicial y entrada al directorio. |
| `discovery` | Directorio, búsqueda y filtros. Incluye la pantalla temporal del directorio. |
| `restaurants` | Ficha pública del restaurante, información, horarios y menú. Incluye la ficha temporal. |
| `availability` | Consulta de disponibilidad por restaurante, fecha, hora y número de personas. Directorio reservado. |
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

Los directorios reservados contienen `.gitkeep` para que Git los incluya antes de incorporar su primera implementación. Las pantallas actuales son demostrativas. La disponibilidad, las reservas, la autenticación, la persistencia y la edición visual están pendientes de implementación.

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

Para probar las rutas dinámicas, abre `/restaurantes/restaurante-demo`, `/restaurantes/restaurante-demo/reservar`, `/editor/demo-restaurant` y `/editor/demo-restaurant/preview`. Los identificadores de estas páginas son demostrativos. Las rutas de cuenta y del editor, incluida la vista previa, requieren autenticación y autorización reales en el servidor antes de producción.

## Responsabilidades

Angel y Luis mantienen esta aplicación. Su alcance incluye el directorio, las fichas públicas, la búsqueda, la disponibilidad y el flujo de reserva. La gestión interna, la API y el análisis de video pertenecen a sus respectivos equipos.

La integración consumirá operaciones públicas o de cliente definidas en `contracts/openapi.yaml` cuando el responsable de backend publique el contrato. Las responsabilidades del monorepo se describen en [Plan.md](../../Plan.md).
