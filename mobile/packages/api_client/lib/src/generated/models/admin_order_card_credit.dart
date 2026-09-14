// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_card_credit.g.dart';

/// Лимит отсрочки юрлица (модуль scoring). null — заказ физлица либо скоринг ещё не считался.
@JsonSerializable()
class AdminOrderCardCredit {
  const AdminOrderCardCredit({
    required this.limit,
    required this.available,
    required this.reserved,
  });

  factory AdminOrderCardCredit.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardCreditFromJson(json);

  final num limit;
  final num available;
  final num reserved;

  Map<String, Object?> toJson() => _$AdminOrderCardCreditToJson(this);
}
