-- Очистка тестовых данных перед запуском (2026-10-05): все заказы и всё, что от
-- них зависит, корзины, тестовый покупатель. Каталог, остатки, компании,
-- сотрудники, настройки и учётки покупателей остаются.
--
-- Остатки: отгрузка (fulfillment) списала товар со склада — возвращаем его;
-- резервы заказов снимаем. Нумерация заказов и документов начинается заново.
--
-- Запуск (одна транзакция, при ошибке ничего не меняется):
--   docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--     -v ON_ERROR_STOP=1 -f - < cleanup-test-orders.sql

BEGIN;

-- 1. Вернуть на склады то, что списали отгрузки.
WITH shipped AS (
  SELECT f.location_id, fi.inventory_item_id, SUM(fi.quantity) AS qty
  FROM fulfillment f
  JOIN fulfillment_item fi ON fi.fulfillment_id = f.id AND fi.deleted_at IS NULL
  WHERE f.canceled_at IS NULL AND f.deleted_at IS NULL
  GROUP BY 1, 2
)
UPDATE inventory_level il
SET stocked_quantity = il.stocked_quantity + s.qty,
    raw_stocked_quantity = jsonb_build_object(
      'value', (il.stocked_quantity + s.qty)::text, 'precision', 20),
    updated_at = now()
FROM shipped s
WHERE il.location_id = s.location_id
  AND il.inventory_item_id = s.inventory_item_id
  AND il.deleted_at IS NULL;

-- 2. Снять резервы заказов и пересчитать зарезервированное.
DELETE FROM reservation_item
WHERE line_item_id IN (SELECT id FROM order_line_item);

UPDATE inventory_level il
SET reserved_quantity = COALESCE(r.qty, 0),
    raw_reserved_quantity = jsonb_build_object(
      'value', COALESCE(r.qty, 0)::text, 'precision', 20),
    updated_at = now()
FROM inventory_level l
LEFT JOIN (
  SELECT location_id, inventory_item_id, SUM(quantity) AS qty
  FROM reservation_item WHERE deleted_at IS NULL GROUP BY 1, 2
) r ON r.location_id = l.location_id AND r.inventory_item_id = l.inventory_item_id
WHERE il.id = l.id;

-- 3. Наши модули: жизненный цикл, сборка, документы, отзывы, претензии, рейсы,
--    бонусы (вся история — тестовая; счета остаются с нулём).
DELETE FROM order_lifecycle_event;
DELETE FROM order_lifecycle;
DELETE FROM assembly_task_item;
DELETE FROM assembly_task;
DELETE FROM document;
DELETE FROM document_sequence;
DELETE FROM review;
DELETE FROM dispute;
DELETE FROM trip_stop;
DELETE FROM trip;
DELETE FROM bonus_transaction;
UPDATE bonus_account SET balance = 0, raw_balance = jsonb_build_object('value', '0', 'precision', 20), updated_at = now();

-- 4. Связи заказа, корзины, оплаты и отгрузки (link-таблицы без внешних ключей).
DELETE FROM order_order_order_lifecycle_order_lifecycle;
DELETE FROM order_order_bonus_bonus_transaction;
DELETE FROM company_company_order_order;
DELETE FROM order_cart;
DELETE FROM order_fulfillment;
DELETE FROM order_payment_collection;
DELETE FROM order_promotion;
DELETE FROM cart_payment_collection;
DELETE FROM cart_promotion;
DELETE FROM payment_collection_payment_providers;

-- 5. Возвраты, обмены, претензии ядра.
DELETE FROM return_item;
DELETE FROM return_fulfillment;
DELETE FROM return;
DELETE FROM order_claim_item_image;
DELETE FROM order_claim_item;
DELETE FROM order_claim;
DELETE FROM order_exchange_item;
DELETE FROM order_exchange;

-- 6. Заказы.
DELETE FROM order_change_action;
DELETE FROM order_change;
DELETE FROM order_credit_line;
DELETE FROM order_transaction;
DELETE FROM order_summary;
DELETE FROM order_shipping_method_adjustment;
DELETE FROM order_shipping_method_tax_line;
DELETE FROM order_shipping;
DELETE FROM order_shipping_method;
DELETE FROM order_line_item_adjustment;
DELETE FROM order_line_item_tax_line;
DELETE FROM order_item;
DELETE FROM order_line_item;
DELETE FROM "order";
DELETE FROM order_address;

-- 7. Отгрузки (наборы доставки, зоны и способы доставки остаются).
DELETE FROM fulfillment_label;
DELETE FROM fulfillment_item;
DELETE FROM fulfillment;
DELETE FROM fulfillment_address;

-- 8. Оплаты.
DELETE FROM refund;
DELETE FROM capture;
DELETE FROM payment;
DELETE FROM payment_session;
DELETE FROM payment_collection;

-- 9. Корзины.
DELETE FROM credit_line;
DELETE FROM cart_line_item_adjustment;
DELETE FROM cart_line_item_tax_line;
DELETE FROM cart_line_item;
DELETE FROM cart_shipping_method_adjustment;
DELETE FROM cart_shipping_method_tax_line;
DELETE FROM cart_shipping_method;
DELETE FROM cart;
DELETE FROM cart_address;

-- 10. Тестовый покупатель сквозной проверки (+77010000099).
DELETE FROM customer_customer_bonus_bonus_account
WHERE customer_id IN (SELECT id FROM customer WHERE phone = '+77010000099');
DELETE FROM customer_address
WHERE customer_id IN (SELECT id FROM customer WHERE phone = '+77010000099');
DELETE FROM provider_identity
WHERE auth_identity_id IN (
  SELECT id FROM auth_identity
  WHERE app_metadata->>'customer_id' IN (SELECT id FROM customer WHERE phone = '+77010000099')
);
DELETE FROM auth_identity
WHERE app_metadata->>'customer_id' IN (SELECT id FROM customer WHERE phone = '+77010000099');
DELETE FROM customer WHERE phone = '+77010000099';

-- 11. Нумерация заказов — с №1.
ALTER SEQUENCE order_display_id_seq RESTART WITH 1;

COMMIT;
