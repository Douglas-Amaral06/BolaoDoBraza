import { StyleSheet, TextStyle } from 'react-native';

export const typography = StyleSheet.create({
  // Headings
  heading1: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
  } as TextStyle,

  heading2: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
  } as TextStyle,

  heading3: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } as TextStyle,

  // Subtitles
  subtitle1: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  } as TextStyle,

  subtitle2: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Body
  body1: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  } as TextStyle,

  body2: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  // Captions
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  // Numbers (tabular, monodigit)
  number: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  numberSm: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  // Buttons
  buttonLg: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  } as TextStyle,

  buttonMd: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  // Labels (caps, badges)
  label: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textTransform: 'uppercase',
  } as TextStyle,
});
