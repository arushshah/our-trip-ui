import React, { useState, useCallback } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useAuth } from 'src/context/AuthContext';
import { Box, Typography, TextField, IconButton, InputAdornment, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function SignInView() {
  const router = useRouter();
  const authContext = useAuth();
  if (!authContext) {
    throw new Error('AuthContext is null');
  }
  const { signIn } = authContext;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await signIn(username, password);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message);
    }
  }, [username, password, signIn]);

  return (
    <div>
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2" color="text.secondary">
          Don’t have an account?
          <a href="/create-account">Get started</a>
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <TextField
          fullWidth
          name="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>
    </div>
  );
}