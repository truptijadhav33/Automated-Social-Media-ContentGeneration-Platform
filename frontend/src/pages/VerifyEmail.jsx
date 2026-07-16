import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      apiService.verifyEmail(token)
        .then(() => {
          setStatus('success');
          toast.success('Email verified!');
        })
        .catch(() => {
          setStatus('error');
        });
    } else {
      setStatus('error');
    }
  }, [token]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await apiService.resendVerification(searchParams.get('email') || '');
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">Your email has been verified. You can now use all features.</p>
            <Link
              to="/login"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Sign in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
            <p className="text-gray-500 mb-4">
              {token ? 'This verification link is invalid or has expired.' : 'No verification token provided.'}
            </p>
            <button
              onClick={handleResend}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
            <p className="text-sm text-gray-500">
              <Link to="/login" className="text-purple-600 hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
