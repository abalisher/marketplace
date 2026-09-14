// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_order_payment_state.dart';

part 'admin_order_lifecycle_order.g.dart';

/// Заказ строкой очереди панели продавца: всё уже готово к отрисовке — имя плательщика, признак юрлица, число позиций, итог, состояние оплаты и адрес доставки считает бэкенд.
@JsonSerializable()
class AdminOrderLifecycleOrder {
  const AdminOrderLifecycleOrder({
    required this.id,
    this.displayId,
    this.email,
    this.createdAt,
    this.customerName,
    this.companyId,
    this.isCompany,
    this.itemCount,
    this.total,
    this.currencyCode,
    this.paymentState,
    this.address,
  });

  factory AdminOrderLifecycleOrder.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleOrderFromJson(json);

  final String id;
  @JsonKey(name: 'display_id')
  final int? displayId;
  final String? email;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// Человекочитаемый плательщик: название компании → ФИО → телефон → email.
  @JsonKey(name: 'customer_name')
  final String? customerName;

  /// Компания-покупатель, если заказ оформлен от имени юрлица.
  @JsonKey(name: 'company_id')
  final String? companyId;

  /// Заказ оформлен юрлицом (нужен счёт и АВР).
  @JsonKey(name: 'is_company')
  final bool? isCompany;

  /// Число позиций заказа.
  @JsonKey(name: 'item_count')
  final int? itemCount;

  /// Итог заказа в основной единице валюты (тенге — целые).
  final num? total;
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// Состояние оплаты для панели: деньги получены/авторизованы, ждём оплату или оплата отменена. null — платёжной сессии нет.
  @JsonKey(name: 'payment_state')
  final AdminOrderLifecycleOrderPaymentState? paymentState;

  /// Адрес доставки одной строкой (улица, город).
  final String? address;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleOrderToJson(this);
}
