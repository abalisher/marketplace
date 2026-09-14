import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:marketplace_partner/shared/offline_error.dart';

DioException _error(DioExceptionType type, {Response<dynamic>? response}) {
  return DioException(
    requestOptions: RequestOptions(path: '/admin/assembly-tasks'),
    type: type,
    response: response,
  );
}

void main() {
  test('обрыв связи и таймауты — это «нет сети»', () {
    expect(isOfflineError(_error(DioExceptionType.connectionError)), isTrue);
    expect(isOfflineError(_error(DioExceptionType.connectionTimeout)), isTrue);
    expect(isOfflineError(_error(DioExceptionType.sendTimeout)), isTrue);
    expect(isOfflineError(_error(DioExceptionType.receiveTimeout)), isTrue);
    expect(isOfflineError(_error(DioExceptionType.unknown)), isTrue);
  });

  test('ответ сервера — не сеть: отказ показываем, а не прячем в очередь', () {
    final response = Response<dynamic>(
      requestOptions: RequestOptions(path: '/admin/assembly-tasks'),
      statusCode: 409,
    );
    expect(
      isOfflineError(_error(DioExceptionType.badResponse, response: response)),
      isFalse,
    );
    // Даже «неизвестная» ошибка с ответом — это ответ сервера.
    expect(
      isOfflineError(_error(DioExceptionType.unknown, response: response)),
      isFalse,
    );
  });

  test('обычное исключение сетью не считается', () {
    expect(isOfflineError(Exception('boom')), isFalse);
  });
}
