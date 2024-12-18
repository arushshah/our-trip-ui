import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/context/AuthContext';
import {apiUrl} from '../config';


// ----------------------------------------------------------------------

const InvitationRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { token = '' } = useParams<{ token: string }>();
  const {idToken} = useAuth();

  useEffect(() => {
    let isMounted = true;

    const acceptInvite = async () => {
      try {
        const response = await fetch(`${apiUrl}/trip_guests/accept-invite`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trip_token: token,
          }),
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          navigate(`/view-invite/${data.trip_id}`);
        } else {
          console.error('Failed to accept invite');
          navigate('/home')
        }
      } catch (error) {
        console.error('Error accepting invite:', error);
      }
    };

    if (token) {
      acceptInvite();
    }

    return () => {
      isMounted = false;
    };
  }, [idToken, token, navigate]);

  return null;
};

export default InvitationRedirect;