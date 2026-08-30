#!/bin/bash
# ============================================================
#  CommercePulse_AI_Network — API Health Test Script
# ============================================================
#  Tests all 7 backend endpoints and reports status + latency.
#
#  Usage:  ./test-apis.sh
#  Requires: server running on http://localhost:3000
# ============================================================

BASE="${1:-http://localhost:3000}"
PASS=0; FAIL=0; MOCK=0

GREEN='\033[0;32m'; YELLOW='\033[0;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   CommercePulse_AI_Network — Live API Health Check                      ║${NC}"
echo -e "${BOLD}║   Target: $BASE${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

test_endpoint() {
  local NAME="$1"; local METHOD="$2"; local URL="$3"; local DATA="$4"; local EXPECT="$5"
  local START=$(($(date +%s%N)/1000000))

  if [ "$METHOD" = "POST" ]; then
    RESPONSE=$(curl -s -m 15 -X POST "$BASE$URL" -H "Content-Type: application/json" -d "$DATA")
  else
    RESPONSE=$(curl -s -m 15 "$BASE$URL")
  fi

  local END=$(($(date +%s%N)/1000000))
  local LAT=$((END - START))

  if [ -z "$RESPONSE" ]; then
    echo -e "  ${RED}✗ FAIL${NC}  ${NAME}  ${RED}— no response${NC}"
    FAIL=$((FAIL+1)); return
  fi

  if echo "$RESPONSE" | grep -q "\"$EXPECT\""; then
    if echo "$RESPONSE" | grep -q '"source":"mock"'; then
      echo -e "  ${YELLOW}⚠ MOCK${NC}  ${NAME}  ${YELLOW}— ${LAT}ms (no key, mock fallback)${NC}"
      MOCK=$((MOCK+1))
    else
      echo -e "  ${GREEN}✓ LIVE${NC}  ${NAME}  ${GREEN}— ${LAT}ms${NC}"
      PASS=$((PASS+1))
    fi
  else
    echo -e "  ${RED}✗ FAIL${NC}  ${NAME}  ${RED}— missing '$EXPECT' in response${NC}"
    FAIL=$((FAIL+1))
  fi
}

echo -e "${CYAN}┌─ BACKEND ───────────────────────────────────────────────┐${NC}"
test_endpoint "Health Check        " "GET"  "/api/health"                                          ""   "ok"
echo ""
echo -e "${CYAN}┌─ LIVE DATA ─────────────────────────────────────────────┐${NC}"
test_endpoint "NASA FIRMS (fires)  " "GET"  "/api/fires?lat=22.4156&lng=85.2034"                  ""   "fires"
test_endpoint "Open-Meteo (weather)" "GET"  "/api/weather?lat=25.6342&lng=86.0723"                ""   "current"
test_endpoint "iNaturalist (species)" "GET" "/api/species?lat=23.0234&lng=85.2891"                ""   "obs"
test_endpoint "Wikipedia REST      " "GET"  "/api/wiki?query=Santhal_people"                     ""   "extract"
echo ""
echo -e "${CYAN}┌─ AI / SATELLITE ────────────────────────────────────────┐${NC}"
test_endpoint "Sentinel-2 NDVI scan" "POST" "/api/scan"  '{"groveId":"KHU-001","lat":23.0234,"lng":85.2891}' "ndviCurrent"
test_endpoint "AI Chat (Singbonga) " "POST" "/api/chat"  '{"message":"What species are protected?","groveContext":{"name":"Murhu","tribe":"Munda","deity":"Singbonga","species":[{"n":"Sal"},{"n":"Mahua"}]}}' "reply"

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  RESULTS${NC}"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}LIVE:${NC}  $PASS endpoints using real APIs"
echo -e "  ${YELLOW}MOCK:${NC}  $MOCK endpoints using mock fallback (add keys to upgrade)"
echo -e "  ${RED}FAIL:${NC}  $FAIL endpoints broken (server down?)"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ ALL ENDPOINTS RESPONDING${NC}"
else
  echo -e "  ${RED}${BOLD}✗ Some endpoints failed — is the server running? Try: node server.js${NC}"
fi
echo ""
