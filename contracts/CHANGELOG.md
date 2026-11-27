# Cambios de contratos

## 0.1.0 — 2026-11-27

- Contrato inicial REST: autenticación de personal, restaurantes, usuarios,
  mesas, zonas, productos, menú, pedidos, reservas, directorio, reportes y visión.
- Esquemas de eventos de atención, mesas, pedidos y reservas; protocolo WebSocket.
- Aislamiento por restaurante, roles, formato de errores, privacidad de reservas,
  concurrencia e idempotencia de reservas públicas.
- Generador reproducible, ejemplos y validación automática.
- Ramas de video y BD parten de esta entrega; integración a main por Antigravity.

### Decisiones para consumidores

- PWA: mostrar `unattended` encima del estado operativo de la mesa.
- Web pública: consultar disponibilidad por horario y personas; la API asigna mesa.
- Reservas de invitado: guardar el token de gestión como secreto; UUID no autoriza acceso.
- Tiempo real: pedir ticket efímero y resincronizar por REST al reconectar.
- Cuentas de cliente y correo Resend quedan para integraciones posteriores.

## Propuestas pendientes

Sin propuestas. Añadir aquí solicitante, caso de uso, ruta/evento propuesto,
impacto y estado. Manuel revisa antes de cambiar los contratos.
