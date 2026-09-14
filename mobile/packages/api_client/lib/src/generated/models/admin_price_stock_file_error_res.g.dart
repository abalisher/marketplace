// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_file_error_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockFileErrorRes _$AdminPriceStockFileErrorResFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockFileErrorRes(
  message: json['message'] as String,
  fileError: json['file_error'] == null
      ? null
      : AdminPriceStockFileErrorResFileError.fromJson(
          json['file_error'] as String,
        ),
);

Map<String, dynamic> _$AdminPriceStockFileErrorResToJson(
  AdminPriceStockFileErrorRes instance,
) => <String, dynamic>{
  'message': instance.message,
  'file_error':
      ?_$AdminPriceStockFileErrorResFileErrorEnumMap[instance.fileError],
};

const _$AdminPriceStockFileErrorResFileErrorEnumMap = {
  AdminPriceStockFileErrorResFileError.emptyFile: 'empty_file',
  AdminPriceStockFileErrorResFileError.noColumns: 'no_columns',
  AdminPriceStockFileErrorResFileError.tooManyRows: 'too_many_rows',
  AdminPriceStockFileErrorResFileError.mixedLocations: 'mixed_locations',
  AdminPriceStockFileErrorResFileError.unknownLocation: 'unknown_location',
  AdminPriceStockFileErrorResFileError.locationMismatch: 'location_mismatch',
  AdminPriceStockFileErrorResFileError.tooManyChanges: 'too_many_changes',
  AdminPriceStockFileErrorResFileError.$unknown: r'$unknown',
};
