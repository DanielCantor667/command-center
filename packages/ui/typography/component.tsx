import { createElement, forwardRef } from 'react';
import { cn } from '../lib/cn';
import { TYPOGRAPHY_TRUNCATE_STYLE, typographyAlignStyles, typographyColorStyles, typographyVariantStyles } from './styles';
import type { TypographyProps, TypographyVariant } from './types';

const defaultElementByVariant: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
  'display-xl': 'h1',
  'display-l': 'h1',
  'heading-xl': 'h2',
  'heading-l': 'h2',
  'heading-m': 'h3',
  title: 'h4',
  'body-l': 'p',
  body: 'p',
  'body-small': 'p',
  caption: 'span',
  mono: 'code',
  'mono-small': 'code',
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  { variant = 'body', as, color = 'primary', align, truncate = false, className, children, ...rest },
  ref,
) {
  const Component = as ?? defaultElementByVariant[variant];

  return createElement(
    Component,
    {
      ref,
      className: cn(
        typographyVariantStyles[variant],
        typographyColorStyles[color],
        align && typographyAlignStyles[align],
        truncate && TYPOGRAPHY_TRUNCATE_STYLE,
        className,
      ),
      ...rest,
    },
    children,
  );
});

type ConvenienceProps = Omit<TypographyProps, 'variant'>;

export const Display = forwardRef<HTMLHeadingElement, ConvenienceProps & { size?: 'xl' | 'l' }>(function Display(
  { size = 'xl', ...rest },
  ref,
) {
  return <Typography ref={ref} variant={size === 'xl' ? 'display-xl' : 'display-l'} {...rest} />;
});

export const Heading = forwardRef<HTMLHeadingElement, ConvenienceProps & { size?: 'xl' | 'l' | 'm' }>(function Heading(
  { size = 'l', ...rest },
  ref,
) {
  const variantMap = { xl: 'heading-xl', l: 'heading-l', m: 'heading-m' } as const;
  return <Typography ref={ref} variant={variantMap[size]} {...rest} />;
});

export const Title = forwardRef<HTMLHeadingElement, ConvenienceProps>(function Title(props, ref) {
  return <Typography ref={ref} variant="title" {...props} />;
});

export const Body = forwardRef<HTMLParagraphElement, ConvenienceProps & { size?: 'l' | 'default' | 'small' }>(
  function Body({ size = 'default', ...rest }, ref) {
    const variantMap = { l: 'body-l', default: 'body', small: 'body-small' } as const;
    return <Typography ref={ref} variant={variantMap[size]} {...rest} />;
  },
);

export const Caption = forwardRef<HTMLSpanElement, ConvenienceProps>(function Caption(props, ref) {
  return <Typography ref={ref} variant="caption" {...props} />;
});

export const Mono = forwardRef<HTMLElement, ConvenienceProps & { size?: 'default' | 'small' }>(function Mono(
  { size = 'default', ...rest },
  ref,
) {
  return <Typography ref={ref} variant={size === 'small' ? 'mono-small' : 'mono'} {...rest} />;
});
