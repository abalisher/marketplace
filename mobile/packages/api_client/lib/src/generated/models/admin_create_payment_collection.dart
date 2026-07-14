// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_payment_collection.g.dart';

/// The payment collection's details.
@JsonSerializable()
class AdminCreatePaymentCollection {
  const AdminCreatePaymentCollection({
    required this.orderId,
    required this.amount,
  });

  factory AdminCreatePaymentCollection.fromJson(Map<String, Object?> json) =>
      _$AdminCreatePaymentCollectionFromJson(json);

  /// The ID of the associated order.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The amount to be paid.
  final num amount;

  Map<String, Object?> toJson() => _$AdminCreatePaymentCollectionToJson(this);
}
