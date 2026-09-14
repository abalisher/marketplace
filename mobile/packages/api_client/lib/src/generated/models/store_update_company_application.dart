// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_company_file.dart';

part 'store_update_company_application.g.dart';

/// Хотя бы одно поле обязательно: пустая правка отклоняется с 400.
@JsonSerializable()
class StoreUpdateCompanyApplication {
  const StoreUpdateCompanyApplication({this.name, this.bin, this.files});

  factory StoreUpdateCompanyApplication.fromJson(Map<String, Object?> json) =>
      _$StoreUpdateCompanyApplicationFromJson(json);

  final String? name;

  /// БИН — ровно 12 цифр. У одобренной компании реквизиты менять нельзя.
  final String? bin;

  /// Догружаемые учредительные документы содержимым (base64). Считаются вместе с уже приложенными: всего у компании не более 4 файлов.
  final List<StoreCreateCompanyFile>? files;

  Map<String, Object?> toJson() => _$StoreUpdateCompanyApplicationToJson(this);
}
