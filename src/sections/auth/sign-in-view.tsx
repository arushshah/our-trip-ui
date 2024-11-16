import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { Box, Typography, TextField, Button } from '@mui/material';
import { signInWithPhoneNumber, ConfirmationResult, getAuth, RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import {apiUrl} from 'src/config';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export function SignInView() {
  const authContext = useAuth();
  const navigate = useNavigate();

  if (!authContext) {
    throw new Error('AuthContext is null');
  }
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const idTokenRef = useRef<string | null>(null);
  const auth = getAuth();
  
  const validatePhoneNumber = (number: string) => /^(\+1\s?)?\d{10}$/.test(number);
  const formatPhoneNumber = (number: string) => `+1${number}`;

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (otpSent) {
      setOtpSent(false);
      setConfirmationResult(null);
    }
  };

  const setupRecaptcha = useCallback(() => {
    const container = document.getElementById('recaptcha-container');
    if (container && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: 'invisible',
        callback: () => console.info('reCAPTCHA solved'),
        'expired-callback': () => console.info('reCAPTCHA expired'),
      });
    }
  }, [auth]);
  
  useEffect(() => {
    setupRecaptcha();
    return () => {
      // Clean up reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier; // Prevent future calls to an old instance
      }
    };
  }, [setupRecaptcha]);

  const handleSendOtp = async () => {
    
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Invalid phone number');
      return;
    }
    setErrorMessage('');
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const response = await fetch(`${apiUrl}/users/validate-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone_number: formattedPhoneNumber })
    })

    const data = await response.json();
    if (data.error === 'User does not exist.') {
      setErrorMessage('Phone number not registered. Please create an account.');
      return;
    }

    setLoading(true);
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      console.info('OTP sent');
    } catch (error) {
      setErrorMessage('Failed to send OTP. Please try again.');
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          idTokenRef.current = token;
          localStorage.setItem('idToken', token);
          navigate('/');
        });
      }
    });
    return () => unsubscribe();
  }, [navigate, auth]);

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setErrorMessage('No OTP sent');
      return;
    }
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
    } catch (error) {
      setErrorMessage('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign in or
          <Link to='/create-account' style={{color: 'black'}}> create an account</Link> 
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

      {!otpSent ? (
            <>
              <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                variant="standard"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                sx={{ mb: 3 }}
                error={!!errorMessage}
                helperText={errorMessage}
              />
              <Button
                fullWidth
                size="large"
                type="submit"
                color="inherit"
                variant="contained"
                onClick={handleSendOtp}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
            <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                variant="standard"
                value={phoneNumber}
                InputProps={{
                  readOnly: true
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                required
                fullWidth
                id="otp"
                label="Enter Verification Code Sent to Your Phone"
                variant="standard"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mt: 3, mb: 3 }}
              />
              <Button
                fullWidth
                size="large"
                type="submit"
                color="inherit"
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
            </>
          )}
          <div id="recaptcha-container" />
      </Box>
    </div>
  );
}