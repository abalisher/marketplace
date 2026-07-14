// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_options_client.dart';

// dart format off

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

// ignore_for_file: unnecessary_brace_in_string_interps,no_leading_underscores_for_local_identifiers,unused_element,unnecessary_string_interpolations,unused_element_parameter,avoid_unused_constructor_parameters,unreachable_from_main,avoid_redundant_argument_values

class _ProductOptionsClient implements ProductOptionsClient {
  _ProductOptionsClient(this._dio, {this.baseUrl, this.errorLogger});

  final Dio _dio;

  String? baseUrl;

  final ParseErrorLogger? errorLogger;

  @override
  Future<GetStoreProductOptionsResponse> getProductOptions({
    required String xPublishableApiKey,
    String? xMedusaLocale,
    String? locale,
    String? q,
    dynamic title,
    bool? isExclusive,
    dynamic createdAt,
    dynamic updatedAt,
    dynamic deletedAt,
    num? limit,
    num? offset,
    String? order,
    bool? withDeleted,
    String? fields,
    List<dynamic>? and,
    List<dynamic>? or,
    dynamic id,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'locale': locale,
      r'q': q,
      r'title': title.toJson(),
      r'is_exclusive': isExclusive,
      r'created_at': createdAt.toJson(),
      r'updated_at': updatedAt.toJson(),
      r'deleted_at': deletedAt.toJson(),
      r'limit': limit,
      r'offset': offset,
      r'order': order,
      r'with_deleted': withDeleted,
      r'fields': fields,
      r'$and': and,
      r'$or': or,
      r'id': id.toJson(),
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{
      r'x-publishable-api-key': xPublishableApiKey,
      r'x-medusa-locale': xMedusaLocale,
    };
    _headers.removeWhere((k, v) => v == null);
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<GetStoreProductOptionsResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/store/product-options',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late GetStoreProductOptionsResponse _value;
    try {
      _value = GetStoreProductOptionsResponse.fromJson(_result.data!);
    } on Object catch (e, s) {
      errorLogger?.logError(e, s, _options, response: _result);
      rethrow;
    }
    return _value;
  }

  @override
  Future<StoreProductOptionResponse> getProductOptionsId({
    required String id,
    required String xPublishableApiKey,
    String? xMedusaLocale,
    String? locale,
    String? fields,
  }) async {
    final _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'locale': locale,
      r'fields': fields,
    };
    queryParameters.removeWhere((k, v) => v == null);
    final _headers = <String, dynamic>{
      r'x-publishable-api-key': xPublishableApiKey,
      r'x-medusa-locale': xMedusaLocale,
    };
    _headers.removeWhere((k, v) => v == null);
    const Map<String, dynamic>? _data = null;
    final _options = _setStreamType<StoreProductOptionResponse>(
      Options(method: 'GET', headers: _headers, extra: _extra)
          .compose(
            _dio.options,
            '/store/product-options/${id}',
            queryParameters: queryParameters,
            data: _data,
          )
          .copyWith(baseUrl: _combineBaseUrls(_dio.options.baseUrl, baseUrl)),
    );
    final _result = await _dio.fetch<Map<String, Object?>>(_options);
    late StoreProductOptionResponse _value;
    try {
      _value = StoreProductOptionResponse.fromJson(_result.data!);
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
