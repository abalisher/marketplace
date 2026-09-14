import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_typography.dart';

/// Счётчик количества «− N +».
///
/// Два режима, потому что мест применения два:
///  * ПРОСТОЙ (исходный) — [onIncrement]/[onDecrement]: строка корзины в
///    кабинете. Без колбэков кнопки неактивны (карточка только показывает).
///  * ЦЕЛЕВОЙ (T10.15) — [onChanged] отдаёт НОВОЕ количество: карточка подбора
///    в чате и полоса корзины. Здесь появляются два поведения, которых у
///    простого режима нет:
///     — ноль это не «0» на счётчике, а кнопка [addLabel] («В корзину»): минус
///       при нуле бессмысленен, а пустой счётчик читается как «уже добавлено
///       нулём»;
///     — само число становится кнопкой: 30 мешков 30 нажатиями не набирают,
///       тап открывает ввод с клавиатуры.
///    Минус на единице в этом режиме убирает позицию совсем (возврат к кнопке),
///    а не оставляет ноль — иначе в корзине копились бы пустые строки.
///
/// Строки локализованы на уровне фичи и приходят параметрами — ui_kit остаётся
/// презентационным и локаль-агностичным.
class AppQuantityStepper extends StatefulWidget {
  const AppQuantityStepper({
    required this.value,
    this.onIncrement,
    this.onDecrement,
    this.onChanged,
    this.addLabel,
    this.increaseLabel,
    this.decreaseLabel,
    this.quantityLabel,
    this.enabled = true,
    super.key,
  });

  /// Текущее количество; 0 в целевом режиме — позиции в корзине нет.
  final int value;

  /// Простой режим: «стало на единицу больше/меньше».
  final VoidCallback? onIncrement;
  final VoidCallback? onDecrement;

  /// Целевой режим: новое количество (0 — убрать позицию).
  final ValueChanged<int>? onChanged;

  /// Подпись кнопки нулевого состояния («В корзину») — только целевой режим.
  final String? addLabel;

  /// Метки доступности кнопок «+», «−» и числа.
  final String? increaseLabel;
  final String? decreaseLabel;
  final String? quantityLabel;

  final bool enabled;

  @override
  State<AppQuantityStepper> createState() => _AppQuantityStepperState();
}

class _AppQuantityStepperState extends State<AppQuantityStepper> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (!_focusNode.hasFocus && _isEditing) {
        _commit();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  /// Целевой режим — только когда фича передала [AppQuantityStepper.onChanged].
  bool get _isTargetMode => widget.onChanged != null;

  VoidCallback? get _increase {
    if (!widget.enabled) return null;
    final onChanged = widget.onChanged;
    if (onChanged != null) return () => onChanged(widget.value + 1);
    return widget.onIncrement;
  }

  VoidCallback? get _decrease {
    if (!widget.enabled) return null;
    final onChanged = widget.onChanged;
    if (onChanged != null) {
      return () => onChanged(widget.value <= 1 ? 0 : widget.value - 1);
    }
    return widget.onDecrement;
  }

  void _startEditing() {
    _controller.text = '${widget.value}';
    _controller.selection = TextSelection(
      baseOffset: 0,
      extentOffset: _controller.text.length,
    );
    setState(() => _isEditing = true);
    _focusNode.requestFocus();
  }

  void _commit() {
    final parsed = int.tryParse(_controller.text.replaceAll(RegExp(r'\D'), ''));
    setState(() => _isEditing = false);
    if (parsed == null || parsed == widget.value) return;
    widget.onChanged?.call(parsed < 0 ? 0 : parsed);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.chip);

    // Нулевое состояние есть только у целевого режима: в простом ноль — это
    // обычное количество строки корзины, и счётчик остаётся счётчиком.
    if (_isTargetMode && widget.value <= 0) {
      return OutlinedButton.icon(
        onPressed: _increase,
        icon: const Icon(Icons.add, size: 18),
        label: Text(widget.addLabel ?? ''),
        style: OutlinedButton.styleFrom(
          foregroundColor: colors.ink,
          side: BorderSide(color: colors.border),
          shape: RoundedRectangleBorder(borderRadius: borderRadius),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          minimumSize: const Size(0, 40),
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      );
    }

    return Container(
      height: 40,
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        border: Border.all(color: colors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepButton(
            icon: Icons.remove,
            label: widget.decreaseLabel,
            onPressed: _decrease,
          ),
          SizedBox(width: 48, child: _value(colors, borderRadius)),
          _StepButton(
            icon: Icons.add,
            label: widget.increaseLabel,
            onPressed: _increase,
          ),
        ],
      ),
    );
  }

  /// Число: в целевом режиме — кнопка с вводом, иначе просто текст.
  Widget _value(AppColorTokens colors, BorderRadius borderRadius) {
    if (_isEditing) {
      return TextField(
        controller: _controller,
        focusNode: _focusNode,
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        textAlign: TextAlign.center,
        textInputAction: TextInputAction.done,
        onSubmitted: (_) => _commit(),
        decoration: const InputDecoration(
          isDense: true,
          border: InputBorder.none,
          contentPadding: EdgeInsets.zero,
        ),
        style: AppTypography.bodyLarge.copyWith(color: colors.ink),
      );
    }

    final text = Center(
      child: Text(
        '${widget.value}',
        style: AppTypography.bodyLarge.copyWith(color: colors.ink),
      ),
    );
    if (!_isTargetMode) return text;
    return Semantics(
      button: true,
      label: widget.quantityLabel,
      child: InkWell(
        onTap: widget.enabled ? _startEditing : null,
        borderRadius: borderRadius,
        child: text,
      ),
    );
  }
}

/// Кнопка «+»/«−»: 40×40 внутри пилюли, тап-цель добирается родительской
/// строкой карточки (высота ряда ≥ 48 dp).
class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final IconData icon;
  final String? label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return SizedBox(
      width: 40,
      height: 40,
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, size: 20),
        color: colors.ink,
        tooltip: label,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints.tightFor(width: 40, height: 40),
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}
