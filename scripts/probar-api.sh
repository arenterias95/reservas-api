#!/usr/bin/env bash
# Prueba la API (autenticacion + Taller 7) con curl.
# Uso: bash scripts/probar-api.sh [URL_BASE]   (por defecto http://localhost:3000)
# Reinicie el servidor antes de cada corrida: los datos viven en memoria.

BASE="${1:-http://localhost:3000}"
OK=0; FAIL=0

# check "descripcion" codigo_esperado METODO ruta [token] [json]
check() {
  local desc="$1" esperado="$2" metodo="$3" ruta="$4" token="${5:-}" cuerpo="${6:-}"
  local args=(-s -o /tmp/resp.json -w '%{http_code}' -X "$metodo" "$BASE$ruta")
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$cuerpo" ] && args+=(-H 'Content-Type: application/json' -d "$cuerpo")
  local codigo; codigo=$(curl "${args[@]}")
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
check "Registro con correo repetido" 409 POST /auth/register "" '{"name":"Ana","email":"ana@reservas.edu","password":"Clave123*"}'
check "Registro sin password" 400 POST /auth/register "" '{"name":"X","email":"x@reservas.edu"}'
check "Login con clave incorrecta" 401 POST /auth/login "" '{"email":"ana@reservas.edu","password":"mala"}'
check "/auth/me sin token" 401 GET /auth/me
check "/auth/me con token" 200 GET /auth/me "$ANA"

echo "== Taller 7: 4 filtros / 5 respuestas =="
NUEVO='{"name":"Sala Z","capacity":10,"location":"Bloque A","type":"SALA"}'
check "POST /spaces sin token -> 401" 401 POST /spaces "" "$NUEVO"
check "POST /spaces Ana (USER) -> 403 por rol" 403 POST /spaces "$ANA" "$NUEVO"
check "POST /spaces Williams -> 201" 201 POST /spaces "$WILLIAMS" "$NUEVO"
check "PUT /spaces/2 (de Laura) Williams -> 403 no es dueno" 403 PUT /spaces/2 "$WILLIAMS" '{"capacity":20}'
check "PUT /spaces/2 Laura -> 200" 200 PUT /spaces/2 "$LAURA" '{"capacity":20}'
check "PUT /spaces/4 (sin dueno) ADMIN -> 200" 200 PUT /spaces/4 "$ADMIN" '{"capacity":15}'
check "PUT /spaces/999 Williams -> 404" 404 PUT /spaces/999 "$WILLIAMS" '{"capacity":20}'
check "DELETE /spaces/3 Ana (USER) -> 403" 403 DELETE /spaces/3 "$ANA"
check "DELETE /spaces/2 Williams -> 403 no es dueno" 403 DELETE /spaces/2 "$WILLIAMS"
check "DELETE /spaces/2 Laura -> 204" 204 DELETE /spaces/2 "$LAURA"
check "DELETE /spaces/999 Laura -> 404" 404 DELETE /spaces/999 "$LAURA"

echo
echo "Resultado: $OK pasaron, $FAIL fallaron"
[ "$FAIL" -eq 0 ]
