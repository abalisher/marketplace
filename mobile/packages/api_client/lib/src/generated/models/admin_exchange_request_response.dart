// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_exchange.dart';
import 'admin_order_preview.dart';
import 'admin_return.dart';

part 'admin_exchange_request_response.g.dart';

/// The details of a requested exchange.
@JsonSerializable()
class AdminExchangeRequestResponse {
  const AdminExchangeRequestResponse({
    required this.returnValue,
    required this.orderPreview,
    required this.exchange,
  });

  factory AdminExchangeRequestResponse.fromJson(Map<String, Object?> json) =>
      _$AdminExchangeRequestResponseFromJson(json);

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn returnValue;
  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;
  final AdminExchange exchange;

  Map<String, Object?> toJson() => _$AdminExchangeRequestResponseToJson(this);
}
