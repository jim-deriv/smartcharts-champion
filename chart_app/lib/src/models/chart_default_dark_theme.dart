import 'package:deriv_chart/deriv_chart.dart';
import 'package:deriv_chart/src/theme/text_styles.dart';
import 'package:flutter/material.dart';
import '../helpers/color.dart';

/// An implementation of [ChartDefaultTheme] which provides access to
/// dark theme-related colors and styles for the chart package.
class SmartChartDefaultDarkTheme extends ChartDefaultDarkTheme {

  @override
  Color get base01Color => Color(0xFFFFFFFF);

  @override
  Color get base03Color => Color(0xFFC2C2C2);

  @override
  Color get base04Color => Color(0xFF6E6E6E);

  @override
  Color get base05Color => Color(0xFF3E3E3E);


  @override
  Color get base07Color => getColorFromString('rgba(255, 255, 255, 0.04)');

  @override
  TextStyle get overLine => TextStyles.overLine;

}
