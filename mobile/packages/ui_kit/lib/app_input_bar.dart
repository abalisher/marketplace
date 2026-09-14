import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Композер ассистента (эталон Gemini, бриф T10.1 §3.3): одна крупная пилюля
/// `radius 28` на поверхности с обводкой 1px, фокус — обводка акцентом 2px.
/// Внутри пилюли: слот [leading] (скрепка, T10.4), поле с авторостом до
/// [maxLines] строк и слот [trailing] (микрофон и отмена записи, T10.3) перед
/// круглой кнопкой отправки 48×48. Слоты пустые до реализации своих тасков —
/// неактивных заглушек не рисуем (замечание прогонов «мешает»).
///
/// Голосовой ввод (T10.3): на время записи поле уступает место индикатору —
/// [fieldReplacement].
///
/// Вложения (T10.4): чипы выбранных файлов стоят НАД полем внутри той же
/// пилюли — слот [above]; с ними отправка разрешена и при пустом поле
/// ([allowEmpty]).
///
/// Черновик держит переданный [controller] (родитель очищает его после
/// отправки). Поле НЕ блокируется на время хода ассистента: покупатель может
/// печатать следующий вопрос, недоступна только отправка — за это отвечает
/// отдельный [sendEnabled], а [enabled] выключает поле целиком.
/// [sendLabel] — озвучка кнопки отправки для screen reader (у кнопки только
/// иконка).
///
/// Стриминг ответа (T10.1d): если передан [onStop], то на время хода (когда
/// [sendEnabled] = false) круглая кнопка превращается в «Стоп» — прервать ответ
/// можно там же, где только что была отправка, как в эталоне Gemini.
class AppInputBar extends StatefulWidget {
  const AppInputBar({
    required this.controller,
    required this.onSend,
    this.enabled = true,
    this.sendEnabled = true,
    this.allowEmpty = false,
    this.hintText,
    this.sendLabel,
    this.onStop,
    this.stopLabel,
    this.leading,
    this.trailing,
    this.above,
    this.fieldReplacement,
    super.key,
  });

  final TextEditingController controller;
  final ValueChanged<String> onSend;

  /// Доступно ли поле для ввода.
  final bool enabled;

  /// Доступна ли отправка (на время хода ассистента — false, поле при этом
  /// остаётся редактируемым).
  final bool sendEnabled;

  /// Можно ли отправить ПУСТОЕ поле. Обычно нет — отправлять нечего; но со
  /// вложением можно: снимок листа без подписи это нормальное сообщение
  /// (T10.4), и придумывать подпись за покупателя нечестно.
  final bool allowEmpty;

  final String? hintText;
  final String? sendLabel;

  /// Прервать идущий ход. Не передан — «Стоп» не показываем (ход непрерываемый).
  final VoidCallback? onStop;

  /// Озвучка кнопки «Стоп» для screen reader.
  final String? stopLabel;

  /// Слот слева внутри пилюли — вложения (T10.4).
  final Widget? leading;

  /// Слот справа внутри пилюли, перед отправкой — голосовой ввод (T10.3).
  final Widget? trailing;

  /// Слот НАД полем, внутри той же пилюли — выбранные вложения (T10.4).
  /// Именно внутри: реплика и файлы уходят одним сообщением, и выглядеть это
  /// должно как одно целое, а не как строка, приклеенная сверху.
  final Widget? above;

  /// Замена поля ввода на время голосовой записи (T10.3): пока микрофон
  /// слушает, вместо поля стоит индикатор с таймером. Именно ЗАМЕНА, а не
  /// строка рядом: иначе непонятно, слушают сейчас или уже нет.
  final Widget? fieldReplacement;

  /// Потолок автороста поля (бриф: 1 строка → максимум 8, дальше внутренний
  /// скролл).
  static const int maxLines = 8;

  /// Сторона круглой кнопки отправки.
  static const double sendSide = 48;

  @override
  State<AppInputBar> createState() => _AppInputBarState();
}

class _AppInputBarState extends State<AppInputBar> {
  final _focus = FocusNode();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onChanged);
    _focus.addListener(_onChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onChanged);
    _focus.dispose();
    super.dispose();
  }

  void _onChanged() => setState(() {});

  bool get _canSend =>
      widget.enabled &&
      widget.sendEnabled &&
      (widget.allowEmpty || widget.controller.text.trim().isNotEmpty);

  /// Ход идёт (отправка недоступна) и его можно прервать.
  bool get _canStop => !widget.sendEnabled && widget.onStop != null;

  void _submit() {
    if (!_canSend) return;
    widget.onSend(widget.controller.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final focused = _focus.hasFocus;
    // Обводка фокуса толще на 1px — компенсируем внутренним отступом, иначе
    // пилюля дёргалась бы по высоте на каждый фокус.
    final borderWidth = focused ? 2.0 : 1.0;
    final inset = focused ? AppSpacing.xs - 1 : AppSpacing.xs;
    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.composer),
        border: Border.all(
          color: focused ? colors.accent : colors.border,
          width: borderWidth,
        ),
      ),
      padding: EdgeInsets.all(inset),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (widget.above != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.sm,
                AppSpacing.xs,
                AppSpacing.sm,
                AppSpacing.sm,
              ),
              child: widget.above!,
            ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              ?widget.leading,
              if (widget.fieldReplacement != null)
                Expanded(child: widget.fieldReplacement!)
              else
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                    ),
                    child: TextField(
                      controller: widget.controller,
                      focusNode: _focus,
                      enabled: widget.enabled,
                      minLines: 1,
                      maxLines: AppInputBar.maxLines,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _submit(),
                      style: AppTypography.bodyLarge.copyWith(
                        color: colors.ink,
                      ),
                      decoration: InputDecoration(
                        isDense: true,
                        filled: false,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        disabledBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.md + 2,
                        ),
                        hintText: widget.hintText,
                        hintStyle: AppTypography.bodyLarge.copyWith(
                          color: colors.inkSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ?widget.trailing,
              if (_canStop)
                _StopButton(onTap: widget.onStop!, label: widget.stopLabel)
              else
                _SendButton(
                  enabled: _canSend,
                  onTap: _submit,
                  label: widget.sendLabel,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Круглая кнопка «Стоп» 48×48 на месте отправки, пока печатается ответ
/// (T10.1d): контрастная (ink), с квадратом внутри — как в эталоне.
class _StopButton extends StatelessWidget {
  const _StopButton({required this.onTap, this.label});

  final VoidCallback onTap;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: colors.ink,
        shape: const CircleBorder(),
        child: InkWell(
          onTap: onTap,
          customBorder: const CircleBorder(),
          child: SizedBox(
            width: AppInputBar.sendSide,
            height: AppInputBar.sendSide,
            child: Icon(Icons.stop_rounded, size: 24, color: colors.surface),
          ),
        ),
      ),
    );
  }
}

/// Круглая кнопка отправки 48×48: акцент, когда есть что отправить.
class _SendButton extends StatelessWidget {
  const _SendButton({required this.enabled, required this.onTap, this.label});

  final bool enabled;
  final VoidCallback onTap;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Semantics(
      button: true,
      enabled: enabled,
      label: label,
      child: Material(
        color: enabled ? colors.accent : colors.surfaceDim,
        shape: const CircleBorder(),
        child: InkWell(
          onTap: enabled ? onTap : null,
          customBorder: const CircleBorder(),
          child: SizedBox(
            width: AppInputBar.sendSide,
            height: AppInputBar.sendSide,
            child: Icon(
              Icons.arrow_upward,
              size: 22,
              color: enabled ? colors.onAccent : colors.inkSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
