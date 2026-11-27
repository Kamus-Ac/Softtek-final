"""Genera los contratos versionados. Ejecutar desde cualquier directorio."""
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent


class ContractDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        # Sin anchors YAML para facilitar lectores y generadores de clientes.
        return True


def ref(name):
    return {"$ref": f"#/components/schemas/{name}"}


def string(**kw):
    return {"type": "string", **kw}


def enum(*values):
    return string(enum=list(values))


def integer(minimum=0, **kw):
    return {"type": "integer", "minimum": minimum, **kw}


def array(items, **kw):
    return {"type": "array", "items": items, **kw}


def obj(properties, required=None):
    return {"type": "object", "additionalProperties": False,
            "properties": properties, "required": list(properties) if required is None else required,
            **({"minProperties": 1} if required == [] else {})}


UUID = string(format="uuid")
DT = string(format="date-time")
TEXT = string(minLength=1, maxLength=200)
BOOL = {"type": "boolean"}
S = {}
S["Role"] = enum("platform_admin", "gerente", "mesero", "cocina")
S["TableState"] = enum("libre", "ocupada", "pidio", "cuenta")
S["OrderState"] = enum("pendiente", "en_preparacion", "lista", "servida", "cancelada")
S["ReservationState"] = enum("pendiente", "confirmada", "cancelada", "llego", "no_asistio")
S["Error"] = obj({"code": TEXT, "message": TEXT, "request_id": TEXT,
                  "details": array(obj({"field": TEXT, "message": TEXT}))},
                 ["code", "message", "request_id"])
S["LoginRequest"] = obj({"email": string(format="email"), "password": string(minLength=1, maxLength=128),
                         "restaurant_id": UUID})
S["User"] = obj({"id": UUID, "restaurant_id": {"type": ["string", "null"], "format": "uuid"},
                 "name": TEXT, "email": string(format="email"), "role": ref("Role"), "active": BOOL})
S["TokenResponse"] = obj({"access_token": string(minLength=1), "token_type": enum("bearer"),
                          "expires_in": integer(1), "user": ref("User")})
S["UserCreate"] = obj({"name": TEXT, "email": string(format="email"),
                       "password": string(minLength=12, maxLength=128),
                       "role": enum("gerente", "mesero", "cocina")})
S["UserUpdate"] = obj({"name": TEXT, "role": enum("gerente", "mesero", "cocina"), "active": BOOL}, [])
S["OpeningInterval"] = obj({"day": integer(0, maximum=6),
                            "opens": string(pattern=r"^([01]\d|2[0-3]):[0-5]\d$"),
                            "closes": string(pattern=r"^([01]\d|2[0-3]):[0-5]\d$" )})
restaurant_fields = {"name": TEXT, "slug": string(pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$", maxLength=100),
                     "description": string(maxLength=4000), "city": TEXT, "address": TEXT,
                     "cuisine": TEXT, "timezone": string(examples=["America/Mexico_City"]),
                     "opening_hours": array(ref("OpeningInterval")),
                     "image_url": string(format="uri", pattern="^https://"),
                     "reservation_duration_minutes": integer(15, maximum=480),
                     "unattended_threshold_seconds": integer(30, maximum=3600), "published": BOOL}
S["RestaurantCreate"] = obj(restaurant_fields, ["name", "slug", "city", "address", "cuisine", "timezone", "opening_hours"])
S["RestaurantUpdate"] = obj(restaurant_fields, [])
S["Restaurant"] = obj({"id": UUID, **restaurant_fields},
                       ["id", "name", "slug", "city", "address", "cuisine", "timezone", "opening_hours",
                        "reservation_duration_minutes", "unattended_threshold_seconds", "published"])
S["PublicRestaurant"] = obj({"id": UUID, **{k: v for k, v in restaurant_fields.items()
    if k not in ("published", "unattended_threshold_seconds")}},
    ["id", "name", "slug", "city", "address", "cuisine", "timezone", "opening_hours", "reservation_duration_minutes"])
table_fields = {"name": TEXT, "capacity": integer(1, maximum=100),
                "position_x": {"type": "number", "minimum": 0, "maximum": 1},
                "position_y": {"type": "number", "minimum": 0, "maximum": 1}, "active": BOOL}
S["TableCreate"] = obj(table_fields, ["name", "capacity", "position_x", "position_y"])
S["TableUpdate"] = obj(table_fields, [])
S["Table"] = obj({"id": UUID, "restaurant_id": UUID, **table_fields, "state": ref("TableState"),
                  "unattended": BOOL, "updated_at": DT})
S["TableStateUpdate"] = obj({"state": ref("TableState")})
S["Point"] = array({"type": "number", "minimum": 0, "maximum": 1}, minItems=2, maxItems=2)
zone_fields = {"table_id": UUID, "camera_id": TEXT, "polygon": array(ref("Point"), minItems=3, maxItems=64)}
S["ZoneCreate"] = obj(zone_fields)
S["ZoneUpdate"] = obj(zone_fields, [])
S["Zone"] = obj({"id": UUID, "restaurant_id": UUID, **zone_fields})
product_fields = {"name": TEXT, "description": string(maxLength=2000), "category": TEXT,
                  "price_minor": integer(0), "available": BOOL}
S["ProductCreate"] = obj(product_fields, ["name", "category", "price_minor"])
S["ProductUpdate"] = obj(product_fields, [])
S["Product"] = obj({"id": UUID, "restaurant_id": UUID, **product_fields})
S["Menu"] = obj({"restaurant_id": UUID, "currency": string(pattern="^[A-Z]{3}$", examples=["MXN"]),
                 "products": array(ref("Product"))})
S["OrderItemInput"] = obj({"product_id": UUID, "quantity": integer(1, maximum=100),
                           "notes": string(maxLength=500)}, ["product_id", "quantity"])
S["OrderCreate"] = obj({"table_id": UUID, "items": array(ref("OrderItemInput"), minItems=1, maxItems=100)})
S["OrderItem"] = obj({"product_id": UUID, "name": TEXT, "quantity": integer(1),
                      "unit_price_minor": integer(), "notes": string(maxLength=500)},
                     ["product_id", "name", "quantity", "unit_price_minor"])
S["Order"] = obj({"id": UUID, "restaurant_id": UUID, "table_id": UUID, "created_by": UUID,
                  "state": ref("OrderState"), "items": array(ref("OrderItem"), minItems=1),
                  "total_minor": integer(), "currency": string(pattern="^[A-Z]{3}$"),
                  "created_at": DT, "updated_at": DT})
S["OrderStateUpdate"] = obj({"state": ref("OrderState")})
S["AvailabilitySlot"] = obj({"starts_at": DT, "ends_at": DT, "party_size": integer(1, maximum=100),
                             "available_tables": integer()})
S["Availability"] = obj({"restaurant_id": UUID, "timezone": TEXT, "slots": array(ref("AvailabilitySlot"))})
reservation_fields = {"starts_at": DT, "party_size": integer(1, maximum=100), "guest_name": TEXT,
                      "guest_email": string(format="email", maxLength=254),
                      "guest_phone": string(minLength=7, maxLength=30), "notes": string(maxLength=1000)}
S["PublicReservationCreate"] = obj({**reservation_fields, "privacy_consent": {"const": True, "type": "boolean"},
    "privacy_notice_version": string(minLength=1, maxLength=50)},
    ["starts_at", "party_size", "guest_name", "guest_email", "privacy_consent", "privacy_notice_version"])
S["ReservationCreate"] = obj({**reservation_fields, "table_id": UUID},
                            ["starts_at", "party_size", "guest_name", "guest_email"])
public_reservation_fields = {"id": UUID, "restaurant_id": UUID, "starts_at": DT, "ends_at": DT,
                              "party_size": integer(1), "state": ref("ReservationState")}
S["PublicReservation"] = obj(public_reservation_fields)
S["PublicReservationCreated"] = obj({**public_reservation_fields,
    "management_token": string(minLength=32, description="Se entrega una sola vez; tratar como secreto.")})
S["Reservation"] = obj({"id": UUID, "restaurant_id": UUID, **reservation_fields, "table_id": UUID,
                        "ends_at": DT, "state": ref("ReservationState"), "created_at": DT},
                       ["id", "restaurant_id", "starts_at", "ends_at", "party_size", "guest_name",
                        "guest_email", "table_id", "state", "created_at"])
S["ReservationStateUpdate"] = obj({"state": ref("ReservationState")})
S["WebSocketTicket"] = obj({"ticket": string(minLength=32), "expires_in": integer(1, maximum=60),
                            "path": string(examples=["/api/v1/restaurants/{restaurant_id}/ws"])})
S["Report"] = obj({"restaurant_id": UUID, "from": DT, "to": DT, "total_tables": integer(),
                   "occupied_tables": integer(), "occupancy_ratio": {"type": "number", "minimum": 0, "maximum": 1},
                   "unattended_events": integer(), "average_unattended_seconds": {"type": ["number", "null"], "minimum": 0}})
S["EventAccepted"] = obj({"event_id": UUID, "duplicate": BOOL})

# El mismo esquema Event se incrusta en OpenAPI y se exporta como JSON Schema.
event_payloads = {
    "mesa.desatendida": obj({"mesa_id": UUID, "desde": DT, "duracion_seg": integer(),
                              "severidad": enum("advertencia", "critica")}),
    "mesa.atendida": obj({"mesa_id": UUID, "desde": DT, "duracion_seg": integer()}),
    "mesa.estado_actualizado": obj({"mesa_id": UUID, "state": ref("TableState"), "unattended": BOOL}),
    "pedido.creado": obj({"order_id": UUID, "mesa_id": UUID, "state": ref("OrderState")}),
    "pedido.estado_actualizado": obj({"order_id": UUID, "mesa_id": UUID, "state": ref("OrderState")}),
    "reserva.estado_actualizado": obj({"reservation_id": UUID, "state": ref("ReservationState")}),
}
event_variants = []
for event_type, payload in event_payloads.items():
    name = "Event" + "".join(part.title() for part in event_type.replace("_", ".").split("."))
    S[name] = obj({"event_id": UUID, "schema_version": enum("1.0"), "type": enum(event_type),
                   "restaurant_id": UUID, "occurred_at": DT,
                   "source": enum("vision" if event_type in ("mesa.desatendida", "mesa.atendida") else "api"),
                   "data": payload})
    event_variants.append(ref(name))
S["Event"] = {"oneOf": event_variants}
S["VisionEvent"] = {"oneOf": event_variants[:2]}

for name in ("Restaurant", "PublicRestaurant", "User", "Table", "Zone", "Product", "Order", "Reservation"):
    S[name + "Page"] = obj({"items": array(ref(name)), "total": integer(), "limit": integer(1, maximum=100), "offset": integer()})

paths = {}
ERRORS = {str(code): {"$ref": f"#/components/responses/Error{code}"}
          for code in (400, 401, 403, 404, 409, 422, 429, 500)}


def param(name, schema, location="query", required=False, description=""):
    return {"name": name, "in": location, "required": required, "schema": schema, "description": description}


PAGE = [param("limit", integer(1, maximum=100, default=20)), param("offset", integer(default=0))]


def operation(path, method, operation_id, summary, response=None, body=None, status=200,
              public=False, roles=None, params=None, security=None, description="", paginated=False):
    parameters = [param(segment[1:-1], UUID, "path", True)
                  for segment in path.split("/") if segment.startswith("{")]
    parameters += params or []
    if paginated:
        parameters += PAGE
    responses = {str(status): {"description": "Operación completada"}, **ERRORS}
    if response:
        responses[str(status)]["content"] = {"application/json": {"schema": ref(response)}}
    op = {"operationId": operation_id, "summary": summary,
          "tags": ["Público" if path.startswith("/public/") else "Visión" if "/vision/" in path else "Auth" if path.startswith("/auth/") else "Gestión"],
          "security": security if security is not None else ([] if public else [{"StaffBearer": []}]),
          "responses": responses}
    if parameters:
        op["parameters"] = parameters
    if roles:
        op["x-roles"] = roles
    if description:
        op["description"] = description
    if body:
        op["requestBody"] = {"required": True, "content": {"application/json": {"schema": ref(body)}}}
    if path.startswith("/public/") and "/reservations" in path:
        responses[str(status)]["headers"] = {"Cache-Control": {"schema": enum("no-store"), "description": "Respuesta privada, no almacenar."}}
    paths.setdefault(path, {})[method] = op


ADMIN = ["platform_admin"]
MANAGER = ["platform_admin", "gerente"]
FLOOR = ["platform_admin", "gerente", "mesero"]
STAFF = ["platform_admin", "gerente", "mesero", "cocina"]

operation("/auth/login", "post", "login", "Iniciar sesión de personal", "TokenResponse", "LoginRequest", public=True,
          description="El restaurant_id selecciona el contexto; la API verifica membresía. Aplicar rate limiting. No almacenar tokens en URLs.")
operation("/auth/me", "get", "getCurrentUser", "Consultar sesión", "User", roles=STAFF)
operation("/restaurants", "get", "listRestaurants", "Listar restaurantes de la plataforma", "RestaurantPage", roles=ADMIN, paginated=True)
operation("/restaurants", "post", "createRestaurant", "Crear restaurante", "Restaurant", "RestaurantCreate", 201, roles=ADMIN)
base = "/restaurants/{restaurant_id}"
operation(base, "get", "getRestaurant", "Consultar configuración del restaurante", "Restaurant", roles=MANAGER)
operation(base, "patch", "updateRestaurant", "Actualizar perfil y configuración", "Restaurant", "RestaurantUpdate", roles=MANAGER)
operation(base, "delete", "archiveRestaurant", "Archivar restaurante y despublicarlo", status=204, roles=ADMIN,
          description="Baja lógica; preserva pedidos y reservas. 409 si hay reservas futuras o pedidos activos.")
for resource, name, write_roles, read_roles in (("users", "User", MANAGER, MANAGER), ("tables", "Table", MANAGER, STAFF),
    ("zones", "Zone", MANAGER, MANAGER), ("products", "Product", MANAGER, STAFF)):
    path = base + "/" + resource
    operation(path, "get", "list" + resource.title(), "Listar " + resource, name + "Page", roles=read_roles, paginated=True)
    operation(path, "post", "create" + name, "Crear " + resource, name, name + "Create", 201, roles=write_roles)
    item_path = path + "/{" + resource[:-1] + "_id}"
    operation(item_path, "get", "get" + name, "Consultar " + resource, name, roles=read_roles)
    operation(item_path, "patch", "update" + name, "Actualizar " + resource, name, name + "Update", roles=write_roles)
    operation(item_path, "delete", "delete" + name, "Dar de baja " + resource, status=204, roles=write_roles,
              description="Baja lógica para usuarios, mesas y productos; preserva referencias históricas. Zonas pueden eliminarse. 409 si existen dependencias operativas activas.")
operation(base + "/tables/{table_id}/state", "patch", "updateTableState", "Cambiar estado operativo de mesa", "Table", "TableStateUpdate", roles=FLOOR)
operation(base + "/menu", "get", "getMenu", "Consultar menú interno", "Menu", roles=STAFF)
operation(base + "/orders", "get", "listOrders", "Listar pedidos", "OrderPage", roles=STAFF, paginated=True,
          params=[param("state", ref("OrderState")), param("table_id", UUID)])
operation(base + "/orders", "post", "createOrder", "Crear pedido", "Order", "OrderCreate", 201, roles=FLOOR,
          description="Precios y total se calculan en servidor; guardar precios históricos. Productos y mesa deben pertenecer al restaurante.")
operation(base + "/orders/{order_id}", "get", "getOrder", "Consultar pedido", "Order", roles=STAFF)
operation(base + "/orders/{order_id}/state", "patch", "updateOrderState", "Cambiar estado de pedido", "Order", "OrderStateUpdate", roles=STAFF,
          description="Transiciones y permisos por estado en README. 409 para transición inválida.")
availability_params = [param("date", string(format="date"), required=True, description="Fecha local del restaurante"),
                       param("party_size", integer(1, maximum=100), required=True)]
operation(base + "/availability", "get", "getInternalAvailability", "Consultar disponibilidad interna", "Availability", roles=FLOOR, params=availability_params)
operation(base + "/reservations", "get", "listReservations", "Listar reservas internas", "ReservationPage", roles=FLOOR, paginated=True,
          params=[param("date", string(format="date"), required=True), param("state", ref("ReservationState"))])
operation(base + "/reservations", "post", "createReservation", "Crear reserva interna", "Reservation", "ReservationCreate", 201, roles=FLOOR)
operation(base + "/reservations/{reservation_id}", "get", "getReservation", "Consultar reserva interna", "Reservation", roles=FLOOR)
operation(base + "/reservations/{reservation_id}/state", "patch", "updateReservationState", "Confirmar, cancelar o marcar llegada", "Reservation", "ReservationStateUpdate", roles=FLOOR)
operation(base + "/reports/occupancy", "get", "getOccupancyReport", "Consultar ocupación actual y tiempos del periodo", "Report", roles=MANAGER,
          params=[param("from", DT, required=True), param("to", DT, required=True)])
operation(base + "/ws-ticket", "post", "createWebSocketTicket", "Emitir ticket efímero de WebSocket", "WebSocketTicket", status=201, roles=STAFF)
operation(base + "/vision/config", "get", "getVisionConfig", "Consultar configuración local de visión", "VisionConfig",
          security=[{"VisionBearer": []}], description="La credencial del dispositivo determina el restaurante y las cámaras autorizadas.")
S["VisionConfig"] = obj({"restaurant_id": UUID, "unattended_threshold_seconds": integer(30), "zones": array(ref("Zone"))})
operation(base + "/vision/events", "post", "ingestVisionEvent", "Recibir evento de visión sin video", "EventAccepted", "VisionEvent", 202,
          security=[{"VisionBearer": []}], description="Validar restaurante y mesa con la credencial del dispositivo. Deduplicar event_id; repetición idéntica devuelve duplicate=true; diferente contenido con el mismo ID devuelve 409.")
operation("/public/restaurants", "get", "listPublicRestaurants", "Buscar restaurantes publicados", "PublicRestaurantPage", public=True, paginated=True,
          params=[param("q", string(maxLength=200)), param("city", TEXT), param("cuisine", TEXT),
                  param("party_size", integer(1, maximum=100), description="Filtra por capacidad; no garantiza disponibilidad para una fecha.")])
pub = "/public/restaurants/{restaurant_id}"
operation(pub, "get", "getPublicRestaurant", "Consultar perfil público", "PublicRestaurant", public=True)
operation(pub + "/menu", "get", "getPublicMenu", "Consultar menú publicado", "Menu", public=True,
          description="Solo productos disponibles de restaurantes publicados.")
operation(pub + "/availability", "get", "getPublicAvailability", "Consultar horarios disponibles", "Availability", public=True, params=availability_params)
idem = param("Idempotency-Key", string(minLength=16, maxLength=128), "header", True,
             "Clave aleatoria por intento lógico; reintentar con la misma clave y cuerpo por 24 horas.")
operation(pub + "/reservations", "post", "createPublicReservation", "Reservar mesa disponible", "PublicReservationCreated", "PublicReservationCreate", 201,
          public=True, params=[idem], description="Asignación atómica de mesa en servidor. 409 si ya no hay disponibilidad. Rate limiting por origen y restaurante; 429 incluye Retry-After.")
management = [{"ReservationBearer": []}]
operation(pub + "/reservations/{reservation_id}", "get", "getPublicReservation", "Consultar reserva con token privado", "PublicReservation", security=management)
operation(pub + "/reservations/{reservation_id}/cancel", "post", "cancelPublicReservation", "Cancelar reserva con token privado", "PublicReservation", security=management,
          description="Operación idempotente para reservas canceladas; 409 si ya llegó o no asistió. Token vinculado a una sola reserva y restaurante.")

spec = {"openapi": "3.1.0", "info": {"title": "Plataforma de restaurantes", "version": "0.1.0",
    "description": "Contrato inicial para demo. Reglas de negocio, permisos y WebSocket en contracts/README.md. No implica backend implementado."},
    "servers": [{"url": "http://localhost:8000/api/v1", "description": "Desarrollo local"}],
    "tags": [{"name": n} for n in ("Auth", "Gestión", "Público", "Visión")], "paths": paths,
    "components": {"schemas": S, "securitySchemes": {
        "StaffBearer": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT", "description": "JWT de personal con sub, role, restaurant_id, exp, iss y aud verificados."},
        "VisionBearer": {"type": "http", "scheme": "bearer", "description": "Credencial de dispositivo aprovisionada fuera de la API pública; vinculada a restaurante y cámaras."},
        "ReservationBearer": {"type": "http", "scheme": "bearer", "description": "Token opaco aleatorio de gestión de UNA reserva; solo se almacena su hash en servidor."}},
        "responses": {f"Error{code}": {"description": desc, "content": {"application/json": {"schema": ref("Error")}},
            **({"headers": {"Retry-After": {"description": "Segundos antes de reintentar", "schema": integer(1)}}} if code == 429 else {})}
            for code, desc in ((400, "Solicitud inválida"), (401, "Credencial ausente, inválida o expirada"),
                (403, "Permiso insuficiente"), (404, "Recurso no encontrado o ajeno al restaurante"),
                (409, "Conflicto de estado o disponibilidad"), (422, "Error de validación"),
                (429, "Límite de intentos excedido"), (500, "Error interno sin detalles sensibles"))}}}


def standalone(value):
    if isinstance(value, dict):
        return {k: v.replace("#/components/schemas/", "#/$defs/") if k == "$ref" else standalone(v)
                for k, v in value.items()}
    if isinstance(value, list):
        return [standalone(v) for v in value]
    return value


event_names = [r["$ref"].split("/")[-1] for r in event_variants]
events = {"$schema": "https://json-schema.org/draft/2020-12/schema",
          "$id": "urn:softtek:restaurant-platform:events:1.0", "title": "Eventos de restaurante v1",
          **standalone(S["Event"]), "$defs": standalone({name: S[name] for name in
            [*event_names, "TableState", "OrderState", "ReservationState"]})}

if __name__ == "__main__":
    (ROOT / "openapi.yaml").write_text(yaml.dump(spec, Dumper=ContractDumper, allow_unicode=True, sort_keys=False), encoding="utf-8")
    (ROOT / "events.schema.json").write_text(json.dumps(events, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generados {len(paths)} paths y {sum(len(p) for p in paths.values())} operaciones.")
