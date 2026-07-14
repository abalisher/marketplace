// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_exchange_delete_response.g.dart';

/// The details of deleting an exchange.
@JsonSerializable()
class AdminExchangeDeleteResponse {
  const AdminExchangeDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'exchange',
  });

  factory AdminExchangeDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminExchangeDeleteResponseFromJson(json);

  /// The exchange's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the exchange was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminExchangeDeleteResponseToJson(this);
}
