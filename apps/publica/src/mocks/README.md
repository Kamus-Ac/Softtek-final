# Datos de demostración

Los nombres, direcciones y contactos de estas fichas se usan en escenarios ficticios. Los correos usan un dominio reservado y las imágenes apuntan a una ilustración local. [Dominios de ejemplo de IANA](https://www.iana.org/help/example-domains)

| Restaurante | Slug | Ubicación | Cocina y menú |
| --- | --- | --- | --- |
| Casa Oliva | `casa-oliva` | San Pedro Garza García, Nuevo León | Italiana tradicional. Bruschetta, tagliatelle y tiramisú, entre otros. |
| Raíz Norte | `raiz-norte` | Monterrey, Nuevo León | Mexicana contemporánea. Esquites, tacos de costilla y pan de elote, entre otros. |
| Kumo | `kumo` | Monterrey, Nuevo León | Japonesa. Edamame, ramen de miso y mochi, entre otros. |

Cada menú incluye tres categorías ordenadas y seis productos con precios en unidades menores de MXN. Uno de los productos de cada menú tiene `isAvailable: false`.

## Organización

- `restaurants.ts` relaciona cada ficha con su menú y sus horarios comerciales mediante los modelos de dominio.
- `menus.ts` contiene el menú de cada restaurante. Los identificadores de categorías y productos son estables.
- `opening-hours.ts` cubre días cerrados, jornadas continuas, intervalos separados y cierres después de medianoche.
- `availability.ts` define escenarios semanales por restaurante. Cada horario tiene una capacidad de grupo ficticia. Los escenarios funcionan para fechas futuras sin depender de la fecha actual.

Los adaptadores de `features/restaurants/services/` y `features/availability/services/` son los consumidores de estos archivos. Las rutas del servidor obtienen los servicios desde `src/lib/data-services.ts`. Las pantallas reciben modelos de dominio.

## Verificación manual

Ejecuta `npm run dev` desde `apps/publica` y abre `/restaurantes`. Sigue los tres enlaces, comprueba que `/restaurantes/restaurante-demo` muestra Casa Oliva y que `/restaurantes/no-existe` devuelve el 404. El alias conserva su enlace a la ruta anterior de reserva.

Para revisar los resultados de los adaptadores desde código de servidor, llama a `dataServices.restaurants.list({ query: "RAIZ" })` y a `dataServices.restaurants.getMenu("rest-raiz-norte")`. La búsqueda devuelve Raíz Norte y el menú contiene tres categorías con dos productos cada una.

En `dataServices.availability.getAvailability`, usa el identificador `rest-casa-oliva` y estos casos con fechas locales en formato `YYYY-MM-DD`:

| Consulta | Resultado esperado |
| --- | --- |
| Un martes válido y 2 personas | Tres horarios. |
| El mismo martes y 6 personas | Un horario. |
| Un lunes válido y 2 personas | Resultado con `slots: []`. |
| Un martes válido y 7 personas | Resultado con `slots: []`. |
| Un identificador desconocido con una consulta válida | `null`. |
| Una fecha inexistente o un grupo de 0 personas | Rechazo con `RangeError`. |

Los horarios simulados se devuelven como instantes RFC 3339 en UTC (`Z`) junto con `America/Mexico_City` para mostrarlos en la zona del restaurante. El escenario usa horas UTC que caen en el mismo día local y reglas semanales independientes de los horarios de apertura. Los resultados son ficticios y se calculan sin persistencia. La interfaz web actual solo integra el directorio y las fichas.
