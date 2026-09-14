import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Компактное поле поиска (высота 40, бриф T10.1 §3.1): иконка лупы слева,
/// подсказка, крестик очистки справа — появляется, когда в поле есть текст.
/// Фильтрацию делает вызывающий: поле лишь сообщает ввод через [onChanged]
/// (черновик держит переданный [controller]).
class AppSearchField extends StatefulWidget {
  const AppSearchField({
    required this.controller,
    required this.hintText,
    required this.clearLabel,
    this.onChanged,
    super.key,
  });

  final TextEditingController controller;

  /// Подсказка поля (уже локализованная).
  final String hintText;

  /// Озвучка/tooltip крестика очистки (у кнопки только иконка).
  final String clearLabel;

  final ValueChanged<String>? onChanged;

  /// Высота поля по брифу.
  static const double height = 40;

  @override
  State<AppSearchField> createState() => _AppSearchFieldState();
}

class _AppSearchFieldState extends State<AppSearchField> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onChanged);
    super.dispose();
  }

  /// Крестик появляется/исчезает по наличию текста — перерисовываем поле.
  void _onChanged() => setState(() {});

  void _clear() {
    widget.controller.clear();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final hasText = widget.controller.text.isNotEmpty;
    return Container(
      height: AppSearchField.height,
      decoration: BoxDecoration(
        color: colors.surfaceDim,
        borderRadius: BorderRadius.circular(AppRadius.chip),
        border: Border.all(color: colors.border),
      ),
      padding: const EdgeInsets.only(left: AppSpacing.md),
      child: Row(
        children: [
          Icon(Icons.search, size: 18, color: colors.inkSecondary),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: TextField(
              controller: widget.controller,
              onChanged: widget.onChanged,
              textInputAction: TextInputAction.search,
              style: AppTypography.bodyMedium.copyWith(color: colors.ink),
              decoration: InputDecoration(
                isDense: true,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
                contentPadding: EdgeInsets.zero,
                hintText: widget.hintText,
                hintStyle: AppTypography.bodyMedium.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
            ),
          ),
          if (hasText)
            Semantics(
              button: true,
              label: widget.clearLabel,
              child: Tooltip(
                message: widget.clearLabel,
                child: InkWell(
                  onTap: _clear,
                  customBorder: const CircleBorder(),
                  child: SizedBox(
                    width: AppSearchField.height,
                    height: AppSearchField.height,
                    child: Icon(
                      Icons.close,
                      size: 16,
                      color: colors.inkSecondary,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
