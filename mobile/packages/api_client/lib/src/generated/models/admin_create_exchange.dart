// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_exchange.g.dart';

/// The exchange's details.
@JsonSerializable()
class AdminCreateExchange {
  const AdminCreateExchange({
    required this.orderId,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminCreateExchange.fromJson(Map<String, Object?> json) =>
      _$AdminCreateExchangeFromJson(json);

  /// The ID of the order this exchange is created for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The exchange's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The exchange's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateExchangeToJson(this);
}
