import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, KeyRound, Loader2, Mail, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function StaffLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMode, setLoginMode] = useState("password");
  const [devOtp, setDevOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({ identifier: "", password: "", code: "", newPassword: "", confirmPassword: "" });

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/staff/login", {
        identifier: formData.identifier,
        password: formData.password,
      });
      const result = await response.json();
      const staff = result.data?.staff || result.staff;

      if (staff) {
        localStorage.setItem("staff_session", JSON.stringify(staff));
        toast({
          title: "Welcome back",
          description: `Logged in as ${staff.name}`,
        });
        setLocation("/staff/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid phone/email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestForgotOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/staff/login/forgot-password/request-otp", {
        identifier: formData.identifier,
      });
      const data = await response.json();
      const payload = data.data || data;

      if (!payload.otpSent) {
        toast({
          title: "OTP not sent",
          description: payload.message || "No staff account found for this phone or email.",
          variant: "destructive",
        });
        return;
      }

      if (data.success || payload.otpSent) {
        setIsOtpSent(true);
        setDevOtp(payload.otp || "");
        toast({
          title: "OTP sent",
          description: payload.message || "Enter the OTP to finish signing in.",
        });
      }
    } catch (error) {
      toast({
        title: "Could not send OTP",
        description: error.message || "Check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyForgotOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/staff/login/forgot-password/verify-otp", {
        identifier: formData.identifier,
        code: formData.code,
      });
      const result = await response.json();
      const token = result.data?.resetToken || result.resetToken;

      if (token) {
        setResetToken(token);
        toast({
          title: "OTP verified",
          description: "Set a new password to continue.",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Passwords do not match", description: "Confirm the new password again.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/staff/login/forgot-password/reset", {
        resetToken,
        newPassword: formData.newPassword,
      });
      const result = await response.json();
      const staff = result.data?.staff || result.staff;

      if (staff) {
        localStorage.setItem("staff_session", JSON.stringify(staff));
        toast({
          title: "Password reset",
          description: `Logged in as ${staff.name}`,
        });
        setLocation("/staff/dashboard");
      }
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message || "Could not reset password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpStep = (mode = loginMode) => {
    setLoginMode(mode);
    setIsOtpSent(false);
    setResetToken("");
    setDevOtp("");
    setFormData((current) => ({
      ...current,
      password: mode === "forgot" ? "" : current.password,
      code: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900/10 via-background to-slate-900/10 p-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Staff Portal</CardTitle>
          <CardDescription>
            {loginMode === "forgot"
              ? resetToken ? "Set a new password for your staff account" : "Use OTP if you forgot your password"
              : "Sign in with your phone/email and password"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={resetToken ? resetPassword : loginMode === "forgot" ? (isOtpSent ? verifyForgotOtp : requestForgotOtp) : handlePasswordLogin}>
          <CardContent className="space-y-4">
            {!resetToken && <div className="space-y-2">
                <Label htmlFor="identifier">Phone or Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  placeholder="9876543210 or staff@example.com"
                  className="pl-9"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                  disabled={isOtpSent}
                />
              </div>
            </div>}
            {!resetToken && <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={loginMode !== "forgot"}
                  disabled={isOtpSent || loginMode === "forgot"}
                  placeholder={loginMode === "forgot" ? "Not required for OTP recovery" : ""}
                />
              </div>
            </div>}
            {isOtpSent && !resetToken && (
              <div className="space-y-2">
                <Label htmlFor="code">OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="6 digit code"
                    className="pl-9"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                {devOtp && (
                  <p className="rounded-md border bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Local test OTP: <span className="font-mono font-semibold text-foreground">{devOtp}</span>
                  </p>
                )}
              </div>
            )}
            {resetToken && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      className="pl-9"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      className="pl-9"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {resetToken ? "Resetting..." : loginMode === "forgot" ? (isOtpSent ? "Verifying..." : "Sending OTP...") : "Signing in..."}
                </>
              ) : (
                resetToken ? "Reset Password" : loginMode === "forgot" ? (isOtpSent ? "Verify OTP" : "Send OTP") : "Sign In"
              )}
            </Button>
            {!isOtpSent && !resetToken && (
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => resetOtpStep(loginMode === "forgot" ? "password" : "forgot")}
              >
                {loginMode === "forgot" ? "I remember my password" : "Forgot password? Use OTP"}
              </Button>
            )}
            {(isOtpSent || resetToken) && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => resetOtpStep()}
              >
                {resetToken ? "Start over" : loginMode === "forgot" ? "Change phone or email" : "Change phone/email or password"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
