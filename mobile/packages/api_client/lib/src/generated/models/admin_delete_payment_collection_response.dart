// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_delete_payment_collection_response.g.dart';

/// The result of deleting the payment collection.
@JsonSerializable()
class AdminDeletePaymentCollectionResponse {
  const AdminDeletePaymentCollectionResponse({
    required this.id,
    required this.deleted,
    this.object = 'payment-collection',
  });

  factory AdminDeletePaymentCollectionResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminDeletePaymentCollectionResponseFromJson(json);

  /// The payment collection's ID.
  final String id;

  /// The name of the object that was deleted.
  final String object;

  /// Whether the object was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminDeletePaymentCollectionResponseToJson(this);
}
