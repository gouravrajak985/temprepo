import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useAuthStore from '../store/authStore';

function OTPVerification({ email, isLogin = false }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { verifyOTP, verifyLoginOTP, resendOTP } = useAuthStore();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const verifyFunction = isLogin ? verifyLoginOTP : verifyOTP;
    const result = await verifyFunction(email, otp);
    
    setLoading(false);
    
    if (result.success) {
      toast.success('Email verified successfully!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await resendOTP(email);
    setResending(false);

    if (result.success) {
      toast.success('OTP resent successfully');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification code to {email}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  className="pl-10"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={handleResend}
                disabled={resending}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                {resending ? 'Sending...' : 'Resend Code'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export default OTPVerification;