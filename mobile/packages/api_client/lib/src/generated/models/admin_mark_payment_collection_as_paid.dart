// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_mark_payment_collection_as_paid.g.dart';

/// The payment details.
@JsonSerializable()
class AdminMarkPaymentCollectionAsPaid {
  const AdminMarkPaymentCollectionAsPaid({
    required this.orderId,
    this.providerId,
  });

  factory AdminMarkPaymentCollectionAsPaid.fromJson(
    Map<String, Object?> json,
  ) => _$AdminMarkPaymentCollectionAsPaidFromJson(json);

  /// The ID of the order associated with the payment collection.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the payment provider to use for marking the payment collection as paid. If not provided, the `system` provider will be used.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  Map<String, Object?> toJson() =>
      _$AdminMarkPaymentCollectionAsPaidToJson(this);
}
