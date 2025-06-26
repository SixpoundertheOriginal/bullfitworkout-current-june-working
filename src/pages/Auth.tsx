
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[AuthPage] Rendering with state:', { 
    isLogin, 
    hasUser: !!user, 
    loading, 
    locationState: location.state 
  });

  // Initialize all form state regardless of user authentication status
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    console.log('[AuthPage] Login form submitted');
    setError(null);
    try {
      await signIn(data.email, data.password);
      console.log('[AuthPage] Login successful, navigating to:', location.state?.from?.pathname || '/overview');
      navigate(location.state?.from?.pathname || '/overview');
    } catch (error: any) {
      console.error('[AuthPage] Login error:', error);
      setError(error.message || 'Login failed');
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    console.log('[AuthPage] Signup form submitted');
    setError(null);
    try {
      await signUp(data.email, data.password, data.fullName);
      console.log('[AuthPage] Signup successful, switching to login');
      setIsLogin(true); // Switch to login view after signup
    } catch (error: any) {
      console.error('[AuthPage] Signup error:', error);
      setError(error.message || 'Signup failed');
    }
  };

  // If already logged in, redirect to requested page or overview
  if (user) {
    const redirectTo = location.state?.from?.pathname || '/overview';
    console.log('[AuthPage] User already logged in, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="w-full max-w-md m-auto">
        <div className="p-8 bg-gray-900 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-300 rounded">
              {error}
            </div>
          )}
          
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          {...field} 
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          {...field} 
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
