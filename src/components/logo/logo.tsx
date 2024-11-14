import type { BoxProps } from '@mui/material/Box';

import { useId, forwardRef } from 'react';

import Box from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    { width, href = '/', height, isSingle = false, disableLink = false, className, sx, ...other },
    ref
  ) => {

    const singleLogo = (
      <Box
        alt="Single logo"
        component="img"
        src='/assets/icons/logo-single.svg'
        width={width ?? '80px'} // Increased size
        height={height ?? '80px'} // Increased size
      />
    );

    const fullLogo = (
      <Box
        alt="Full logo"
        component="img"
        src='/assets/icons/logo-full.svg'
        width={width ?? '120px'} // Increased size
        height={height ?? '40px'} // Increased size
      />
    );

    const baseSize = {
      width: width ?? 80,
      height: height ?? 80,
      ...(!isSingle && {
        width: width ?? 120,
        height: height ?? 40,
      }),
    };

    return (
      <RouterLink href={href} style={{ textDecoration: 'none' }}>
        <Box
          ref={ref}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="Logo"
          sx={{
            ...baseSize,
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          {isSingle ? singleLogo : fullLogo}
        </Box>
      </RouterLink>
    );
  }
);
