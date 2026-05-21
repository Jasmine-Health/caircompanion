import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract OAuth callback parameters from URL
        const access_token = searchParams.get('access_token');
        const token_type = searchParams.get('token_type');
        const expires_in = searchParams.get('expires_in');
        const user_email = searchParams.get('user_email');
        const user_name = searchParams.get('user_name');
        const role = searchParams.get('role');
        const user_json = searchParams.get('user');

        if (!access_token) {
          throw new Error('No access token received');
        }

        // Parse user data if available
        let userData = null;
        if (user_json) {
          try {
            userData = JSON.parse(decodeURIComponent(user_json));
          } catch (e) {
            console.error('Failed to parse user JSON:', e);
          }
        }

        // If user data is not in JSON format, construct it from individual params
        if (!userData && user_email) {
          const nameParts = user_name?.split(' ') || ['', ''];
          userData = {
            email: user_email,
            first_name: nameParts[0] || '',
            last_name: nameParts[1] || '',
            display_name: user_name || '',
            is_active: true,
            role: role || 'patient',
          };
        }

        // Store token and user data
        localStorage.setItem('access_token', access_token);
        if (token_type) localStorage.setItem('token_type', token_type);
        if (expires_in) localStorage.setItem('expires_in', expires_in);

        // Update auth context if user data is available
        if (userData) {
          setTokenAndUser(access_token, userData);
        } else {
          // If no user data, just set the token and fetch user later
          setTokenAndUser(access_token, null);
        }

        // Redirect to voice page
        navigate('/voice');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setTokenAndUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6F42C1]/5 via-white to-[#8b5cf6]/5 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center"
        >
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#6F42C1] text-white py-3 rounded-xl hover:bg-[#5a32a3] transition-colors font-medium"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6F42C1]/5 via-white to-[#8b5cf6]/5 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center"
      >
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-[#6F42C1] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we authenticate you...</p>
      </motion.div>
    </div>
  );
}
