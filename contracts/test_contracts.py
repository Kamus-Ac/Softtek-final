"""Validación ejecutable sin API ni base de datos."""
import copy
import json
import re
import unittest
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate

import build_contracts

ROOT = Path(__file__).resolve().parent
SPEC = yaml.safe_load((ROOT / "openapi.yaml").read_text(encoding="utf-8"))
EVENTS = json.loads((ROOT / "events.schema.json").read_text(encoding="utf-8"))
EXAMPLES = json.loads((ROOT / "examples/events.json").read_text(encoding="utf-8"))


def validator(name):
    # Usa el mismo dialecto JSON Schema que los componentes de OpenAPI 3.1.
    return Draft202012Validator({"$ref": f"#/components/schemas/{name}",
        "components": SPEC["components"]}, format_checker=FormatChecker())


class ContractTests(unittest.TestCase):
    def test_openapi_valid(self):
        validate(SPEC)

    def test_generated_files_are_current(self):
        self.assertEqual(SPEC, build_contracts.spec)
        self.assertEqual(EVENTS, build_contracts.events)

    def test_local_references_resolve(self):
        def walk(node, root):
            if isinstance(node, dict):
                if "$ref" in node:
                    self.assertTrue(node["$ref"].startswith("#/"))
                    target = root
                    for part in node["$ref"][2:].split("/"):
                        target = target[part]
                for child in node.values():
                    walk(child, root)
            elif isinstance(node, list):
                for child in node:
                    walk(child, root)
        walk(SPEC, SPEC)
        walk(EVENTS, EVENTS)

    def test_unique_operations_and_path_parameters(self):
        seen = set()
        for path, methods in SPEC["paths"].items():
            for operation in methods.values():
                self.assertNotIn(operation["operationId"], seen)
                seen.add(operation["operationId"])
                declared = {p["name"] for p in operation.get("parameters", []) if p["in"] == "path"}
                self.assertEqual(set(re.findall(r"\{([^}]+)\}", path)), declared)
                for parameter in operation.get("parameters", []):
                    if parameter["in"] == "path":
                        self.assertTrue(parameter["required"])

    def test_security_boundaries(self):
        for path, methods in SPEC["paths"].items():
            for operation in methods.values():
                security = operation["security"]
                if "/vision/" in path:
                    self.assertEqual(security, [{"VisionBearer": []}])
                elif path.startswith("/public/"):
                    if "{reservation_id}" in path:
                        self.assertEqual(security, [{"ReservationBearer": []}])
                    else:
                        self.assertEqual(security, [])
                elif path == "/auth/login":
                    self.assertEqual(security, [])
                else:
                    self.assertEqual(security, [{"StaffBearer": []}])
                    self.assertTrue(operation.get("x-roles"))

    def test_errors_are_uniform(self):
        for methods in SPEC["paths"].values():
            for operation in methods.values():
                for code in (400, 401, 403, 404, 409, 422, 429, 500):
                    self.assertEqual(operation["responses"][str(code)],
                                     {"$ref": f"#/components/responses/Error{code}"})

    def test_all_event_examples_and_both_contracts(self):
        Draft202012Validator.check_schema(EVENTS)
        event_validator = Draft202012Validator(EVENTS, format_checker=FormatChecker())
        self.assertEqual(len(EXAMPLES), len(EVENTS["oneOf"]))
        self.assertEqual(len({e["type"] for e in EXAMPLES}), len(EXAMPLES))
        for event in EXAMPLES:
            event_validator.validate(event)
            validator("Event").validate(event)

    def test_invalid_events_are_rejected(self):
        mutations = [lambda e: e.pop("restaurant_id"),
                     lambda e: e["data"].update(duracion_seg=-1),
                     lambda e: e["data"].update(severidad="alta"),
                     lambda e: e.update(source="api"),
                     lambda e: e.update(video="base64"),
                     lambda e: e.update(schema_version="2.0"),
                     lambda e: e.update(occurred_at="2026-11-27T18:00:00"),
                     lambda e: e.update(event_id="not-a-uuid")]
        event_validator = Draft202012Validator(EVENTS, format_checker=FormatChecker())
        for mutate in mutations:
            event = copy.deepcopy(EXAMPLES[0])
            mutate(event)
            self.assertFalse(event_validator.is_valid(event), event)
            self.assertFalse(validator("Event").is_valid(event), event)

    def test_vision_cannot_inject_operational_events(self):
        for event in EXAMPLES[:2]:
            validator("VisionEvent").validate(event)
        for event in EXAMPLES[2:]:
            self.assertFalse(validator("VisionEvent").is_valid(event))

    def test_public_reservation_requires_consent(self):
        body = {"starts_at": "2026-12-01T18:00:00Z", "party_size": 2,
                "guest_name": "Cliente demo", "guest_email": "demo@example.com",
                "privacy_consent": True, "privacy_notice_version": "2026-11"}
        v = validator("PublicReservationCreate")
        v.validate(body)
        for changes in ({"privacy_consent": False}, {"party_size": 0},
                        {"table_id": EXAMPLES[0]["data"]["mesa_id"]}):
            self.assertFalse(v.is_valid({**body, **changes}))
        del body["privacy_consent"]
        self.assertFalse(v.is_valid(body))

    def test_public_responses_exclude_sensitive_fields(self):
        fields = SPEC["components"]["schemas"]["PublicRestaurant"]["properties"]
        self.assertNotIn("unattended_threshold_seconds", fields)
        fields = SPEC["components"]["schemas"]["PublicReservation"]["properties"]
        for field in ("guest_name", "guest_email", "guest_phone", "table_id", "management_token"):
            self.assertNotIn(field, fields)

    def test_public_reservation_idempotency_and_cache(self):
        path = "/public/restaurants/{restaurant_id}/reservations"
        operation = SPEC["paths"][path]["post"]
        key = next(p for p in operation["parameters"] if p["name"] == "Idempotency-Key")
        self.assertTrue(key["required"])
        for route, methods in SPEC["paths"].items():
            if route.startswith("/public/") and "/reservations" in route:
                for op in methods.values():
                    success = next(value for code, value in op["responses"].items() if code.startswith("2"))
                    self.assertEqual(success["headers"]["Cache-Control"]["schema"]["enum"], ["no-store"])

    def test_local_manager_cannot_assign_platform_admin(self):
        self.assertFalse(validator("UserCreate").is_valid({"name": "Admin", "email": "a@example.com",
            "password": "very-long-demo-password", "role": "platform_admin"}))
        self.assertFalse(validator("UserUpdate").is_valid({"role": "platform_admin"}))

    def test_patch_and_zone_shapes(self):
        for name in ("Restaurant", "User", "Table", "Zone", "Product"):
            self.assertFalse(validator(name + "Update").is_valid({}))
        valid_zone = {"table_id": EXAMPLES[0]["data"]["mesa_id"], "camera_id": "cam-1",
                      "polygon": [[0, 0], [1, 0], [0, 1]]}
        validator("ZoneCreate").validate(valid_zone)
        self.assertFalse(validator("ZoneCreate").is_valid({**valid_zone, "polygon": [[0, 0], [1, 0]]}))
        self.assertFalse(validator("ZoneCreate").is_valid({**valid_zone, "polygon": [[0, 0], [2, 0], [0, 1]]}))


if __name__ == "__main__":
    unittest.main()
