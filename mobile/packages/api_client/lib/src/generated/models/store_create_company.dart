// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_company_file.dart';

part 'store_create_company.g.dart';

@JsonSerializable()
class StoreCreateCompany {
  const StoreCreateCompany({required this.name, required this.bin, this.files});

  factory StoreCreateCompany.fromJson(Map<String, Object?> json) =>
      _$StoreCreateCompanyFromJson(json);

  final String name;

  /// БИН — ровно 12 цифр.
  final String bin;

  /// Учредительные документы содержимым (base64): до 4 файлов по 3 МБ, только PDF/JPEG/PNG. Ссылки клиент не присылает — их выдаёт бэкенд после загрузки.
  final List<StoreCreateCompanyFile>? files;

  Map<String, Object?> toJson() => _$StoreCreateCompanyToJson(this);
}
