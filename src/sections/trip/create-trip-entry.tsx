import type { CardProps } from '@mui/material/Card';
import type { ColorType } from 'src/theme/core/palette';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

type Props = CardProps & {
  title: string;
  color?: ColorType;
};

export function CreateTripEntry({
  title,
  color = 'error',
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  const renderTrending = (
    <Box
      sx={{
        top: 16,
        gap: 0.5,
        right: 16,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
      }}
    />
  );

  return (
    <Card
      sx={{
        
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        color: '#222831',
        backgroundColor: '#EEEEEE',
        ...sx,
      }}
      {...other}
    >

      {renderTrending}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'h3' }}>{title}</Box>
        </Box>

      </Box>
    </Card>
  );
}
