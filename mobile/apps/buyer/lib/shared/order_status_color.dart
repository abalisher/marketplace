import 'package:flutter/material.dart';
import 'package:ui_kit/app_color_tokens.dart';

/// Цвет статус-бейджа заказа по коду жизненного цикла (макет: доставлен —
/// success, в пути/подтверждён — акцент, в сборке — warning, отменён/возвращён —
/// danger, новый/закрытый/неизвестный — нейтраль). Общий для списка заказов,
/// экрана заказа и вставки «статус заказа» в ленте чата.
Color orderStatusColor(String? status, AppColorTokens colors) =>
    switch (status) {
      'delivered' => colors.success,
      'in_delivery' || 'confirmed' => colors.accent,
      'assembling' || 'partially_assembled' || 'assembled' => colors.warning,
      'canceled' || 'returned' => colors.error,
      _ => colors.inkSecondary,
    };
