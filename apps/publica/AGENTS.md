# Instrucciones para agentes de la web pública

## Alcance

- Trabaja en `apps/publica/`. Coordina con sus responsables cualquier cambio en gestión, servicios, contratos o documentación compartida. Consulta [Plan.md](../../Plan.md) para las responsabilidades y el alcance.
- Implementa rutas con App Router bajo `src/app/`. Usa componentes de servidor por defecto y añade componentes de cliente cuando necesites interacción o APIs del navegador.
- Consulta las guías de la versión instalada en `node_modules/next/dist/docs/` al usar APIs de Next.js.
- Conserva TypeScript estricto y usa `@/*` para importar desde `src/`. Agrupa el código de cada funcionalidad en `src/features/` y coloca los componentes reutilizables en `src/components/`.
- Resuelve los parámetros de ruta y compón las pantallas en `src/app/`. Mantén `src/components/` libre de dependencias de funcionalidades concretas. Importa archivos específicos y evita dependencias circulares. Consulta la [arquitectura modular](README.md#arquitectura-modular).
- Renderiza las fichas de restaurante en el servidor para que sus contenidos sean indexables.
- Mantén la ficha pública y el renderizador de `page-builder` libres de dependencias del workspace y de las herramientas del editor.

## Integración y datos

- Consume solo las operaciones públicas o de cliente de `contracts/openapi.yaml` mediante el cliente generado a partir del contrato cuando esté disponible. Coordina las operaciones que falten con el responsable de backend.
- Mantén los datos simulados en `src/mocks/` y limita su uso a desarrollo y pruebas. Mantén los pedidos y el estado interno de mesas fuera de la web pública.
- Documenta las variables necesarias en `.env.example` sin valores sensibles. Reserva el prefijo `NEXT_PUBLIC_` para valores que puedan exponerse al navegador.
- Cuando se incorporen reservas y cuentas, coordina con backend los límites de intentos e incluye el aviso de privacidad y el consentimiento en el formulario de reserva.

## Validación

- Usa npm desde `apps/publica/` y actualiza `package-lock.json` cuando cambien las dependencias. Incorpora dependencias únicamente cuando una funcionalidad las requiera.
- Ejecuta `npm run lint`, `npm run typecheck` y `npm run build` antes de entregar cambios. Si cambias una ruta, compruébala también con `npm run dev`.
