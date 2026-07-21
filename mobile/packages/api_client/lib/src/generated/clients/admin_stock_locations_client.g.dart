// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_stock_locations_client.dart';

// dart format off

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

// ignore_for_file: unnecessary_brace_in_string_interps,no_leading_underscores_for_local_identifiers,unused_element,unnecessary_string_interpolations,unused_element_parameter,avoid_unused_constructor_parameters,unreachable_from_main,avoid_redundant_argument_values

class _AdminStockLocationsClient implements AdminStockLocationsClient {
  _AdminStockLocationsClient(this._dio, {this.baseUrl, this.errorLogger});

  final Dio _dio;

  String? baseUrl;

  final ParseErrorLogger? errorLogger;

  @override
  Future<AdminStockLocationListResponse> adminGetStockLocations({
    String? fields,
    num? offset,
    num? limit,
    String? order,
    String? q,
    dynamic id,
    dynamic name,
    dynamic addressId,
    dynamic salesChannelId,
    dynamic createdAt,
    dynamic updatedAt,
    dynamic deletedAt,
    List<dynamic>? and,
    List<dynamic>? or,
    bool? withDeleted,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'fields': fields,
      r'offset': offset,
      r'limit': limit,
      r'order': order,
      r'q': q,
      r'id': id.toJson(),
      r'name': name.toJson(),
      r'address_id': addressId.toJson(),
      r'sales_channel_id': salesChannelId.toJson(),
      r'created_at': createdAt.toJson(),
      r'updated_at': updatedAt.toJson(),
      r'deleted_at': deletedAt.toJson(),
      r'$and': and,
      r'$or': or,
      r'with_deleted': withDeleted,
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{};
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<AdminStockLocationListResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/admin/stock-locations',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late AdminStockLocationListResponse _value;
    try {
      _value = AdminStockLocationListResponse.fromJson(_result.data!);
    } on Object catch (e, s) {
      errorLogger?.logError(e, s, _options, response: _result);
      rethrow;
    }
    return _value;
  }

  RequestOptions _setStreamType<T>(RequestOptions requestOptions) {
    if (T != dynamic &&
        !(requestOptions.responseType == ResponseType.bytes ||
            requestOptions.responseType == ResponseType.stream)) {
      if (T == String) {
        requestOptions.responseType = ResponseType.plain;
      } else {
        requestOptions.responseType = ResponseType.json;
      }
    }
    return requestOptions;
  }

  String _combineBaseUrls(String dioBaseUrl, String? baseUrl) {
    if (baseUrl == null || baseUrl.trim().isEmpty) {
      return dioBaseUrl;
    }

    final url = Uri.parse(baseUrl);

    if (url.isAbsolute) {
      return url.toString();
    }

    return Uri.parse(dioBaseUrl).resolveUri(url).toString();
  }
}

// dart format on
