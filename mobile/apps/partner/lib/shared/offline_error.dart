import 'package:dio/dio.dart';

/// «Ошибка не долетела до сервера» — то есть сеть, а не отказ бэкенда.
/// Отличать обязательно: отметку без сети мы кладём в очередь и отправляем
/// позже, а отказ сервера (нельзя отмечать закрытое задание) — это ошибка
/// сборщика, её надо показать, а не прятать в очередь.
///
/// `dart:io` здесь намеренно не импортируется: приложение собирается и под web,
/// где `SocketException` не существует, — обрыв связи там приходит
/// [DioExceptionType.unknown] без ответа.
bool isOfflineError(Object error) {
  if (error is! DioException) {
    return false;
  }
  // Ответ пришёл — сервер жив, сеть ни при чём.
  if (error.response != null) {
    return false;
  }
  switch (error.type) {
    case DioExceptionType.connectionError:
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.unknown:
      return true;
    case DioExceptionType.badResponse:
    case DioExceptionType.cancel:
    case DioExceptionType.badCertificate:
    // Таймаут преобразования тела — работа на самом устройстве, не сеть.
    case DioExceptionType.transformTimeout:
      return false;
  }
}
