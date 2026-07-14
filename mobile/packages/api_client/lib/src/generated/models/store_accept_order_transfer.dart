// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_accept_order_transfer.g.dart';

/// The details of accepting the order transfer.
@JsonSerializable()
class StoreAcceptOrderTransfer {
  const StoreAcceptOrderTransfer({required this.token});

  factory StoreAcceptOrderTransfer.fromJson(Map<String, Object?> json) =>
      _$StoreAcceptOrderTransferFromJson(json);

  /// The order transfer's token issued when the transfer was requested.
  final String token;

  Map<String, Object?> toJson() => _$StoreAcceptOrderTransferToJson(this);
}
