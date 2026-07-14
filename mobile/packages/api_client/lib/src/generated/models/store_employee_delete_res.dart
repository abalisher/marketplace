// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_employee_delete_res.g.dart';

@JsonSerializable()
class StoreEmployeeDeleteRes {
  const StoreEmployeeDeleteRes({
    required this.id,
    required this.object,
    required this.deleted,
  });

  factory StoreEmployeeDeleteRes.fromJson(Map<String, Object?> json) =>
      _$StoreEmployeeDeleteResFromJson(json);

  final String id;
  final String object;
  final bool deleted;

  Map<String, Object?> toJson() => _$StoreEmployeeDeleteResToJson(this);
}
