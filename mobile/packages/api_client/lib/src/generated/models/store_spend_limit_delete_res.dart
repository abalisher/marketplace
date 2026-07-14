// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_spend_limit_delete_res.g.dart';

@JsonSerializable()
class StoreSpendLimitDeleteRes {
  const StoreSpendLimitDeleteRes({
    required this.id,
    required this.object,
    required this.deleted,
  });

  factory StoreSpendLimitDeleteRes.fromJson(Map<String, Object?> json) =>
      _$StoreSpendLimitDeleteResFromJson(json);

  final String id;
  final String object;
  final bool deleted;

  Map<String, Object?> toJson() => _$StoreSpendLimitDeleteResToJson(this);
}
