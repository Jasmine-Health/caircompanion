import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { TermsAndConditionsModal } from '../../components/TermsAndConditionsModal';
import { useOrganization } from '../../contexts/OrganizationContext';
import { register } from '../../services/authService';
import { APIError } from '../../config/api';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function CheckboxRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <button type="button" onClick={onToggle} className="shrink-0 mt-0.5" aria-pressed={checked}>
        {checked ? (
          <CheckSquare className="w-5 h-5 text-[#6F42C1]" />
        ) : (
          <Square className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganization();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToSms, setAgreedToSms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const emailError = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return undefined;
    return EMAIL_REGEX.test(trimmed) ? undefined : 'Please enter a valid email address (e.g., example@domain.com)';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return undefined;
    return password.length >= 6 ? undefined : 'Password must be at least 6 characters';
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return undefined;
    return confirmPassword === password ? undefined : 'Passwords do not match';
  }, [confirmPassword, password]);

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim()) &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    password === confirmPassword &&
    agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setError('Please accept the Terms and Conditions');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        agreed_to_sms: agreedToSms,
        role: 'patient',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        organization_id: selectedOrganization?.id,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message || 'Registration failed. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#8b5cf6] flex flex-col">
      <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-6 pt-4">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-16 h-16 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">CairCompanion</h1>
            <p className="text-white/80 text-sm mt-1">Your Health Companion</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-black/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1 mb-5">Join us today</p>

            {success ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Registration successful! Please login with your credentials.
                </p>
                <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name *"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    icon={<User className="w-5 h-5" />}
                    required
                  />
                  <Input
                    label="Last Name *"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Email *"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  error={emailError}
                  required
                />

                <Input
                  label="Phone (Optional)"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-5 h-5" />}
                />

                <div className="relative">
                  <Input
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    error={passwordError}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password *"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    error={confirmPasswordError}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <CheckboxRow checked={agreedToSms} onToggle={() => setAgreedToSms((v) => !v)}>
                  I agree to receive SMS messages (Optional)
                </CheckboxRow>

                <CheckboxRow checked={agreedToTerms} onToggle={() => setAgreedToTerms((v) => !v)}>
                  <>
                    I accept{' '}
                    <button
                      type="button"
                      className="text-[#6F42C1] font-semibold underline"
                      onClick={() => setShowTerms(true)}
                    >
                      Terms and Conditions
                    </button>
                  </>
                </CheckboxRow>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!isFormValid || isLoading}
                >
                  Create Account
                </Button>

                <p className="text-center text-sm text-gray-500 pt-1">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#6F42C1]">
                    Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
