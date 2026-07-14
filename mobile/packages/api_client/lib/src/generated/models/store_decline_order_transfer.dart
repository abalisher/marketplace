// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_decline_order_transfer.g.dart';

/// The details of declining the order transfer request.
@JsonSerializable()
class StoreDeclineOrderTransfer {
  const StoreDeclineOrderTransfer({required this.token});

  factory StoreDeclineOrderTransfer.fromJson(Map<String, Object?> json) =>
      _$StoreDeclineOrderTransferFromJson(json);

  /// The order transfer's token issued when the transfer was requested.
  final String token;

  Map<String, Object?> toJson() => _$StoreDeclineOrderTransferToJson(this);
}
