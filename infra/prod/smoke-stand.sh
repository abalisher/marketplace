#!/usr/bin/env bash
# Прогон стенда: проверяет не «открылась ли страница», а что каждая роль реально
# работает по текущему адресу — вход, данные, файлы. Нужен после КАЖДОГО переезда
# (set-origin.sh) и просто как проверка живости после развёртывания.
#
# Запуск на сервере: ssh stroymarket 'cd ~/stroymarket/infra/prod && bash smoke-stand.sh'
# Учётки берутся из .env и наружу не печатаются.
set -uo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a

BASE=${PUBLIC_ORIGIN}
IP_BASE=https://95.47.96.14:4440

ok=0; fail=0
say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
check() { # check <описание> <ожидание> <факт>
  if [ "$2" = "$3" ]; then printf '  \033[32m✓\033[0m %-52s %s\n' "$1" "$3"; ok=$((ok+1));
  else printf '  \033[31m✗\033[0m %-52s ожидали %s, получили %s\n' "$1" "$2" "$3"; fail=$((fail+1)); fi
}
contains() { # contains <описание> <подстрока> <текст>
  case "$3" in *"$2"*) printf '  \033[32m✓\033[0m %s\n' "$1"; ok=$((ok+1));;
  *) printf '  \033[31m✗\033[0m %s — не найдено «%s»\n' "$1" "$2"; fail=$((fail+1));; esac
}
code() { curl -sk -o /dev/null -w '%{http_code}' --max-time 40 "$@"; }

say "Страницы по домену $BASE"
check "/health"        200 "$(code "$BASE/health")"
check "/app (панель)"  200 "$(code "$BASE/app")"
check "/picker/ (сборщик)" 200 "$(code "$BASE/picker/")"
jar=$(mktemp); check "/ (витрина)" 200 "$(code -L -c "$jar" -b "$jar" "$BASE/")"

say "Запасной вход по IP (должен остаться рабочим)"
# С САМОГО сервера внешний адрес недоступен: NAT провайдера не разворачивает
# соединение обратно внутрь (hairpin). Поэтому изнутри проверяем nginx напрямую
# по петле, а полноценную проверку внешнего адреса делаем с машины разработчика.
check "nginx по петле (443)" 200 "$(code https://127.0.0.1/health)"
ext=$(code "$IP_BASE/health")
if [ "$ext" = "200" ]; then
  check "IP снаружи /health" 200 "$ext"
else
  printf '  \033[33m~\033[0m %-52s %s (NAT: проверять с машины разработчика)\n' "IP снаружи /health" "$ext"
fi

say "Вход персонала (токен + cookie сессии)"
for role in ADMIN SELLER; do
  eval "email=\$${role}_EMAIL"; eval "pass=\$${role}_PASSWORD"
  tok=$(curl -sk --max-time 40 -X POST "$BASE/auth/user/emailpass" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/')
  if [ -n "$tok" ] && [ "${#tok}" -gt 40 ]; then
    printf '  \033[32m✓\033[0m %-52s токен получен\n' "$role вход"; ok=$((ok+1))
    # Cookie сессии обязана прийти с флагом Secure — иначе панель не войдёт.
    hdr=$(curl -sk --max-time 40 -D - -o /dev/null -X POST "$BASE/auth/session" -H "Authorization: Bearer $tok")
    contains "$role cookie сессии с флагом Secure" "Secure" "$hdr"
    [ "$role" = "ADMIN" ] && ADMIN_TOKEN=$tok
  else
    printf '  \033[31m✗\033[0m %-52s токен НЕ получен\n' "$role вход"; fail=$((fail+1))
  fi
done

# Сборщик: учётка на категорию, handle берём первый из созданных скриптом.
picker_email=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select email from \"user\" where email like 'picker.%' order by email limit 1" 2>/dev/null | tr -d '[:space:]')
if [ -n "$picker_email" ]; then
  ptok=$(curl -sk --max-time 40 -X POST "$BASE/auth/user/emailpass" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$picker_email\",\"password\":\"$PICKER_PASSWORD\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/')
  if [ -n "$ptok" ] && [ "${#ptok}" -gt 40 ]; then
    printf '  \033[32m✓\033[0m %-52s токен получен\n' "PICKER вход ($picker_email)"; ok=$((ok+1))
    q=$(curl -sk --max-time 40 "$BASE/admin/assembly-tasks" -H "Authorization: Bearer $ptok")
    contains "очередь заданий сборщика отвечает" '{' "$q"
  else
    printf '  \033[31m✗\033[0m %-52s токен НЕ получен\n' "PICKER вход"; fail=$((fail+1))
  fi
fi

say "Вход покупателя по телефону (dev-канал)"
phone='+77010000001'
pk_hdr="x-publishable-api-key: $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
start=$(curl -sk --max-time 40 -X POST "$BASE/store/auth/phone/otp" \
  -H 'Content-Type: application/json' -H "$pk_hdr" -d "{\"phone\":\"$phone\"}")
dev_code=$(printf '%s' "$start" | sed -E 's/.*"dev_code":"?([0-9]+)"?.*/\1/')
if printf '%s' "$dev_code" | grep -qE '^[0-9]{4,8}$'; then
  printf '  \033[32m✓\033[0m %-52s код получен\n' "запрос кода"; ok=$((ok+1))
  ctok=$(curl -sk --max-time 40 -X POST "$BASE/store/auth/phone/verify" \
    -H 'Content-Type: application/json' -H "$pk_hdr" \
    -d "{\"phone\":\"$phone\",\"code\":\"$dev_code\"}" \
    | sed -E 's/.*"token":"([^"]+)".*/\1/')
  if [ -n "$ctok" ] && [ "${#ctok}" -gt 40 ]; then
    printf '  \033[32m✓\033[0m %-52s токен получен\n' "вход покупателя"; ok=$((ok+1))
  else
    printf '  \033[31m✗\033[0m %-52s токен НЕ получен\n' "вход покупателя"; fail=$((fail+1))
  fi
else
  printf '  \033[31m✗\033[0m %-52s ответ: %.120s\n' "запрос кода" "$start"; fail=$((fail+1))
fi

say "Ассистент покупателя (ядро пути, ходит в Gemini)"
if [ -n "${ctok:-}" ]; then
  # Живой вызов модели: без ключа GEMINI роут отвечает понятной ошибкой, и это
  # тоже надо увидеть — на стенде чат и есть весь путь покупателя.
  ans=$(curl -sk --max-time 120 -X POST "$BASE/store/assistant/chat" \
    -H 'Content-Type: application/json' -H "$pk_hdr" -H "Authorization: Bearer $ctok" \
    -d '{"messages":[{"role":"user","content":"Здравствуйте! Что у вас есть из цемента?"}]}')
  contains "ассистент ответил" '"reply"' "$ans"
else
  printf '  \033[33m~\033[0m %s\n' "ассистент не проверен: нет токена покупателя"
fi

say "Файлы: ссылки в базе ведут на новый адрес и открываются"
bad=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select count(*) from product where thumbnail is not null and thumbnail not like '$BASE%'" 2>/dev/null | tr -d '[:space:]')
check "товаров со старым адресом фото" 0 "${bad:-нет ответа}"
baddoc=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select count(*) from document where file_url is not null and file_url not like '$BASE%'" 2>/dev/null | tr -d '[:space:]')
check "документов со старым адресом файла" 0 "${baddoc:-нет ответа}"

img=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select thumbnail from product where thumbnail is not null limit 1" 2>/dev/null | tr -d '[:space:]')
[ -n "$img" ] && check "фото товара отдаётся ($(printf '%s' "$img" | sed 's|.*/||'))" 200 "$(code "$img")"
doc=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select file_url from document where file_url is not null limit 1" 2>/dev/null | tr -d '[:space:]')
[ -n "$doc" ] && check "PDF документа отдаётся ($(printf '%s' "$doc" | sed 's|.*/||'))" 200 "$(code "$doc")"

say "Каталог витрины (публикуемый ключ) и адрес фото в ответе API"
prods=$(curl -sk --max-time 40 "$BASE/store/products?limit=3" \
  -H "x-publishable-api-key: $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
contains "каталог отдаёт товары" '"products"' "$prods"
contains "фото в ответе API идут с домена" "$BASE/media/" "$prods"

say "Окно сборщика несёт новый адрес в бандле"
# grep по потоку, а не сравнение строк в shell: бандл Flutter'а — несколько
# мегабайт, и обрезка «первых N байт» уводила проверку в ложный провал.
hits=$(curl -sk --max-time 90 "$BASE/picker/main.dart.js" | grep -c "$BASE" || true)
if [ "${hits:-0}" -gt 0 ]; then
  printf '  \033[32m✓\033[0m %-52s вхождений: %s\n' "в сборке /picker/ зашит $BASE" "$hits"; ok=$((ok+1))
else
  printf '  \033[31m✗\033[0m %-52s адрес НЕ найден\n' "в сборке /picker/ зашит $BASE"; fail=$((fail+1))
fi
old_hits=$(curl -sk --max-time 90 "$BASE/picker/main.dart.js" | grep -c "95.47.96.14" || true)
check "старого адреса в бандле сборщика не осталось" 0 "${old_hits:-0}"

printf '\n\033[1mИТОГ: успешно %d, провалено %d\033[0m\n' "$ok" "$fail"
[ "$fail" -eq 0 ]
