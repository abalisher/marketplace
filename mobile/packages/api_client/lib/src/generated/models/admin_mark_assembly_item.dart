// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_mark_assembly_item_status.dart';

part 'admin_mark_assembly_item.g.dart';

@JsonSerializable()
class AdminMarkAssemblyItem {
  const AdminMarkAssemblyItem({
    required this.status,
    this.pickedQuantity,
    this.note,
  });

  factory AdminMarkAssemblyItem.fromJson(Map<String, Object?> json) =>
      _$AdminMarkAssemblyItemFromJson(json);

  /// Набрано целиком / частично / нет в наличии.
  final AdminMarkAssemblyItemStatus status;

  /// Сколько набрано — обязателен для partial (строго от 1 до quantity−1).
  @JsonKey(name: 'picked_quantity')
  final int? pickedQuantity;
  final String? note;

  Map<String, Object?> toJson() => _$AdminMarkAssemblyItemToJson(this);
}
