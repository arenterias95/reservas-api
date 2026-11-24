#!/usr/bin/env bash
# Prueba la API (autenticacion + Taller 7) con curl.
# Uso: bash scripts/probar-api.sh [URL_BASE]   (por defecto http://localhost:3000)
# Reinicie el servidor antes de cada corrida: los datos viven en memoria.

BASE="${1:-http://localhost:3000}"
OK=0; FAIL=0

# check "descripcion" http_esperado METODO ruta [token] [json] [code_esperado]
# Si se da code_esperado, ademas exige el formato {"error":{"code":...,"message":...}}.
check() {
  local desc="$1" esperado="$2" metodo="$3" ruta="$4" token="${5:-}" cuerpo="${6:-}" code="${7:-}"
  local args=(-s -o /tmp/resp.json -w '%{http_code}' -X "$metodo" "$BASE$ruta")
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$cuerpo" ] && args+=(-H 'Content-Type: application/json' -d "$cuerpo")
  local codigo; codigo=$(curl "${args[@]}")
  if [ -n "$code" ] && ! grep -q "\"error\":{\"code\":\"$code\",\"message\":" /tmp/resp.json; then
    echo "  FALLA [$codigo, esperaba code $code] $desc"; cat /tmp/resp.json; echo; FAIL=$((FAIL+1)); return
  fi
  if [ "$codigo" = "$esperado" ]; then
    echo "  PASA  [$codigo] $desc"; OK=$((OK+1))
  else
    echo "  FALLA [$codigo, esperaba $esperado] $desc"; cat /tmp/resp.json; echo; FAIL=$((FAIL+1))
  fi
}

# login EMAIL -> imprime el token
login() {
  curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"${2:-Clave123*}\"}" |
    sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

curl -s -o /dev/null "$BASE/health" || { echo "No hay servidor en $BASE"; exit 1; }

echo "== Autenticacion =="
ADMIN=$(login admin@reservas.edu)
LAURA=$(login laura@reservas.edu)
WILLIAMS=$(login williams@reservas.edu)
check "Login ADMIN" 200 GET /auth/me "$ADMIN"
check "Registro de Ana (siempre USER)" 201 POST /auth/register "" '{"name":"Ana","email":"ana@reservas.edu","password":"Clave123*"}'
ANA=$(login ana@reservas.edu)
check "Registro con correo repetido" 409 POST /auth/register "" '{"name":"Ana","email":"ana@reservas.edu","password":"Clave123*"}' EMAIL_TAKEN
check "Registro sin password" 400 POST /auth/register "" '{"name":"Xavier","email":"x@reservas.edu"}' VALIDATION_ERROR
check "Login con clave incorrecta" 401 POST /auth/login "" '{"email":"ana@reservas.edu","password":"mala"}' INVALID_CREDENTIALS
check "/auth/me sin token" 401 GET /auth/me "" "" TOKEN_MISSING
check "/auth/me con token falso" 401 GET /auth/me "abc.def.ghi" "" TOKEN_INVALID
check "/auth/me con token" 200 GET /auth/me "$ANA"

echo "== Taller 7: 4 filtros / 5 respuestas =="
NUEVO='{"name":"Sala Z","capacity":10,"location":"Bloque A","type":"SALA"}'
check "POST /spaces sin token -> 401" 401 POST /spaces "" "$NUEVO" TOKEN_MISSING
check "POST /spaces Ana (USER) -> 403 por rol" 403 POST /spaces "$ANA" "$NUEVO" FORBIDDEN_ROLE
check "POST /spaces Williams -> 201" 201 POST /spaces "$WILLIAMS" "$NUEVO"
check "PUT /spaces/2 (de Laura) Williams -> 403 no es dueno" 403 PUT /spaces/2 "$WILLIAMS" '{"capacity":20}' NOT_SPACE_OWNER
check "PUT /spaces/2 Laura -> 200" 200 PUT /spaces/2 "$LAURA" '{"capacity":20}'
check "PUT /spaces/4 (sin dueno) ADMIN -> 200" 200 PUT /spaces/4 "$ADMIN" '{"capacity":15}'
check "PUT /spaces/999 Williams -> 404" 404 PUT /spaces/999 "$WILLIAMS" '{"capacity":20}' SPACE_NOT_FOUND
check "DELETE /spaces/3 Ana (USER) -> 403" 403 DELETE /spaces/3 "$ANA"
check "DELETE /spaces/2 Williams -> 403 no es dueno" 403 DELETE /spaces/2 "$WILLIAMS"
check "DELETE /spaces/2 Laura -> 204" 204 DELETE /spaces/2 "$LAURA"
check "DELETE /spaces/999 Laura -> 404" 404 DELETE /spaces/999 "$LAURA" "" SPACE_NOT_FOUND

echo "== Taller errores y validaciones =="
check "400 Zod con dos campos malos (name y capacity)" 400 POST /spaces "$WILLIAMS" '{"name":"A","capacity":-5}' VALIDATION_ERROR
grep -q '"campo":"name"' /tmp/resp.json && grep -q '"campo":"capacity"' /tmp/resp.json \
  && { echo "  PASA  Zod reporta los dos campos"; OK=$((OK+1)); } \
  || { echo "  FALLA Zod no reporto los dos campos"; FAIL=$((FAIL+1)); }
check "capacity como texto \"30\" se convierte (z.coerce)" 201 POST /spaces "$WILLIAMS" '{"name":"Sala Texto","capacity":"30"}'
check "PUT /spaces/1 sin campos -> 400" 400 PUT /spaces/1 "$WILLIAMS" '{}' VALIDATION_ERROR
check "400 JSON mal escrito" 400 POST /auth/login "" '{"email": "admin@reservas.edu",' INVALID_JSON
check "400 id no numerico (/spaces/abc)" 400 GET /spaces/abc "" "" VALIDATION_ERROR
check "404 recurso que no existe (/requesters/999)" 404 GET /requesters/999 "" "" REQUESTER_NOT_FOUND
check "404 ruta que no existe (/cursos)" 404 GET /cursos "" "" ROUTE_NOT_FOUND
check "409 correo de solicitante repetido" 409 POST /requesters "$ADMIN" '{"name":"Otro","email":"laura@universidad.edu"}' DUPLICATE
check "Registro con role ADMIN en el body sigue siendo USER" 201 POST /auth/register "" '{"name":"Pepe","email":"pepe@reservas.edu","password":"Clave123*","role":"ADMIN"}'
grep -q '"role":"USER"' /tmp/resp.json && { echo "  PASA  Zod descarto el role del body"; OK=$((OK+1)); } || { echo "  FALLA el role no se descarto"; FAIL=$((FAIL+1)); }

echo
echo "Resultado: $OK pasaron, $FAIL fallaron"
[ "$FAIL" -eq 0 ]
