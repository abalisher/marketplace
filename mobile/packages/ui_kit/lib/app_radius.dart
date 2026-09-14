/// Токены скругления углов дизайн-системы (значения из макета 2026-07-24).
/// Семантические имена (chip/card/bubble/field) — основной язык; sm/md/lg/pill —
/// алиасы под уже написанные экраны.
abstract final class AppRadius {
  /// 8px — чипы, бейджи.
  static const double chip = 8;

  /// 14px — карточки.
  static const double card = 14;

  /// 16px — пузыри чата, крупные поверхности.
  static const double bubble = 16;

  /// 25px — поля ввода (пилюля строки сообщения).
  static const double field = 25;

  /// 28px — композер ассистента (крупная пилюля эталона Gemini, T10.1).
  static const double composer = 28;

  /// Полное скругление (капсула).
  static const double pill = 999;

  // --- Алиасы под старые токены ---
  /// Алиас [chip] (8px).
  static const double sm = chip;

  /// Алиас [card] (14px).
  static const double md = card;

  /// Алиас [bubble] (16px).
  static const double lg = bubble;
}
