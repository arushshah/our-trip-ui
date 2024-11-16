import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
import { auth, RecaptchaVerifier } from 'src/firebaseConfig';
import { useAuth } from 'src/context/AuthContext';
import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {apiUrl} from 'src/config';

export function CreateAccountView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const validatePhoneNumber = (number: string) => {
    const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
    return phoneNumberPattern.test(number);
  };
  
  const formatPhoneNumber = (number: string) => {
    const cleanedNumber = number.replace(/[^\d]/g, ''); // Remove non-digits
    return `+1${cleanedNumber}`; // Assuming US numbers
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      const container = document.getElementById('recaptcha-container');
      if (container) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
          size: 'invisible',
          callback: () => {
            console.info('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.info('reCAPTCHA expired');
          },
        });
      } else {
        console.error('reCAPTCHA container not found');
      }
    }
  }, []);

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

    if (response.status === 200) {
      setErrorMessage('Phone number already exists. Please sign in.');
      return;
    }

    setLoading(true);

    const appVerifier = window.recaptchaVerifier;

    if (!appVerifier) {
      setLoading(false);
      setErrorMessage('reCAPTCHA has not been set up properly.');
      return;
    }

    try {
      console.log("AUTH: ", auth)
      console.log("PHONE NUMBER: ", formattedPhoneNumber)
      console.log("VERIFIER: ", appVerifier)
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      console.info('OTP sent');
    } catch (error) {
      setLoading(false);
      setErrorMessage('Failed to send OTP. Please try again.');
      console.error('Error sending OTP:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setErrorMessage('No OTP sent');
      return;
    }
    localStorage.setItem('userSetupStarted', 'true');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();
      localStorage.setItem('idToken', idToken);
      setLoading(false);
      console.info(user);
      console.info("Success login, ID Token:", idToken);
      const createUserResponse = await fetch(`${apiUrl}/users/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ phoneNumber: user.phoneNumber, firstName, lastName }),
      });
      console.log("CREATED USER: ", createUserResponse);
      if (createUserResponse.status === 201) {
        console.log("Created user in DB");
        localStorage.removeItem('userSetupStarted');
        navigate('/home');
      }
      else {
        setErrorMessage('Failed to create user in the database.');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', error);
    }
    finally {
      setLoading(false);
      localStorage.removeItem('userSetupStarted');
    }
  };

  return (
    <Box>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Create Account</Typography>
        
      </Box>

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        {!otpSent ? (
            <>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
                />
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
              />
              <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
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
                fullWidth
                name="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: true
                }}
                sx={{ mb: 3 }}
                />
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: true
                }}
                sx={{ mb: 3 }}
              />
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

    </Box>
  );
}