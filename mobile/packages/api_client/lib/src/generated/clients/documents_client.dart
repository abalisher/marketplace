// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_my_documents_res.dart';

part 'documents_client.g.dart';

@RestApi()
abstract class DocumentsClient {
  factory DocumentsClient(Dio dio, {String? baseUrl}) = _DocumentsClient;

  /// List My Documents.
  ///
  /// Все документы покупателя одним списком (кабинет клиента): счета, накладные и АВР по всем его заказам, текущих версий и видимые покупателю. Каждая строка несёт заказ (id и человекочитаемый номер) для перехода в карточку. Скачивание — по file_url.
  @GET('/store/documents')
  Future<StoreMyDocumentsRes> storeListMyDocuments({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
  });
}
