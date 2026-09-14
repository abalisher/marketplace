import 'package:flutter/material.dart';

/// Индикатор загрузки дизайн-системы: центрированный прогресс брендового цвета
/// (цвет — из `progressIndicatorTheme` темы). Использовать для состояний
/// ожидания данных вместо «сырого» [CircularProgressIndicator].
class AppLoader extends StatelessWidget {
  const AppLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}
