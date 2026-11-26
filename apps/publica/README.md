# Web pública de restaurantes

Aplicación pública del monorepo con Next.js App Router, React, TypeScript estricto, Tailwind CSS y ESLint. Las páginas de esta fase permiten recorrer los flujos de navegación.

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

## Estructura

| Ruta | Contenido |
| --- | --- |
| `src/app/` | Rutas, páginas y layouts de App Router. |
| `src/components/` | Componentes reutilizables. |
| `src/features/` | Código agrupado por funcionalidad. |
| `src/lib/` | Utilidades e integraciones compartidas. |
| `src/hooks/` | Hooks reutilizables de React. |
| `src/types/` | Tipos compartidos de la aplicación. |
| `src/config/` | Configuración de la aplicación. |
| `src/styles/` | Hoja global y entrada de Tailwind CSS. |
| `src/mocks/` | Datos simulados para desarrollo y pruebas. |
| `public/images/`, `public/icons/`, `public/fonts/` | Recursos estáticos. |

El alias `@/*` resuelve a `src/*`. Los archivos `.gitkeep` conservan en Git las carpetas vacías.

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
