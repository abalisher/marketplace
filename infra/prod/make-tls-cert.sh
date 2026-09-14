#!/usr/bin/env bash
# Самоподписанный сертификат для HTTPS-входа стенда.
#
# Зачем HTTPS вообще. По незащищённому соединению стенд не работает по
# существу: cookie с флагом Secure не выставляются (не проходит ни вход в
# панель, ни вход покупателя по телефону), а браузер не отдаёт микрофон —
# `navigator.mediaDevices.getUserMedia` доступен только в защищённом контексте,
# и кнопки голоса в чате не существует вовсе.
#
# Зачем САМОПОДПИСАННЫЙ, когда есть домен. Этот сертификат обслуживает ДВА
# соединения, и ни в одном доверенный не получить и не нужен:
#  1. запасной вход по IP (https://95.47.96.14:4440) — на голый IP Let's Encrypt
#     сертификат не выдаёт, а проверка по портам 80/443 здесь не пройдёт:
#     наружу провайдер выводит только 8040/4440;
#  2. внутренний участок «cloudflared → nginx» у именованного туннеля —
#     публичный сертификат домена там предъявляет Cloudflare, а этот участок
#     закрывается галочкой «No TLS Verify» в маршруте туннеля.
# Цена — предупреждение браузера при заходе по IP («Дополнительно → Перейти»).
# На основном адресе (домен через туннель) предупреждения нет.
#
# SAN обязателен: Chrome игнорирует CN и отвергает сертификат без
# subjectAltName. Тип записи разный: у IP — `IP:`, у имени — `DNS:`. Адресов
# можно передать несколько, и по умолчанию их два — домен и IP.
#
# Запуск на сервере: bash make-tls-cert.sh [адрес…]
set -euo pipefail

cd "$(dirname "$0")"

hosts=("$@")
if [ ${#hosts[@]} -eq 0 ]; then
  # Домен — из PUBLIC_ORIGIN, IP — потому что запасной вход обслуживает тот же
  # сертификат, а в PUBLIC_ORIGIN его уже нет.
  from_env=$(awk -F= '$1=="PUBLIC_ORIGIN"{print $2}' .env 2>/dev/null | sed -E 's|^https?://||; s|:[0-9]+$||')
  [ -n "$from_env" ] && hosts+=("$from_env")
  hosts+=("95.47.96.14")
fi
if [ ${#hosts[@]} -eq 0 ]; then
  echo "Не удалось определить адрес. Запустите: bash make-tls-cert.sh stand.kenenai.com 95.47.96.14" >&2
  exit 1
fi

san=""
for host in "${hosts[@]}"; do
  if printf '%s' "$host" | grep -qE '^[0-9]+(\.[0-9]+){3}$'; then
    entry="IP:$host"
  else
    entry="DNS:$host"
  fi
  # Дубли безвредны, но делают вывод нечитаемым (домен из .env может совпасть
  # с добавленным по умолчанию IP).
  case ",$san," in
    *",$entry,"*) continue ;;
  esac
  san="${san:+$san,}$entry"
done

# CN — первый адрес: он же основной вход.
cn=${hosts[0]}

mkdir -p tls
openssl req -x509 -newkey rsa:2048 -nodes \
  -days 825 \
  -keyout tls/stand.key \
  -out tls/stand.crt \
  -subj "/CN=$cn" \
  -addext "subjectAltName=$san" \
  -addext "basicConstraints=critical,CA:FALSE" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth" 2>/dev/null

chmod 600 tls/stand.key
chmod 644 tls/stand.crt

echo "Сертификат выпущен на $cn ($san), срок 825 дней:"
openssl x509 -in tls/stand.crt -noout -subject -dates -ext subjectAltName
