// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_exchange.dart';
import 'admin_order_preview.dart';

part 'admin_exchange_preview_response.g.dart';

/// A preview of the order once the exchange is applied.
@JsonSerializable()
class AdminExchangePreviewResponse {
  const AdminExchangePreviewResponse({
    required this.orderPreview,
    required this.exchange,
  });

  factory AdminExchangePreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminExchangePreviewResponseFromJson(json);

  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;
  final AdminExchange exchange;

  Map<String, Object?> toJson() => _$AdminExchangePreviewResponseToJson(this);
}
