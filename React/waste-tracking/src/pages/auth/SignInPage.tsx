import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const SignInPage = () => {
  // ==============================
  // If user is already logged in, redirect to home
  // This logic is being repeated in SignIn and SignUp..
  const { session } = useSession();
  if (session) return <Navigate to="/" />;
  // maybe we can create a wrapper component for these pages
  // just like the ./router/AuthProtectedRoute.tsx? up to you.
  // ==============================
  const [status, setStatus] = useState("");
  const [supabaseError, setSupabaseError] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    // Clear global supabase error on input change
    if (supabaseError) {
      setSupabaseError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!formValues.email.trim()) newErrors.email = "Email is required.";
    if (!formValues.password.trim()) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStatus("Logging in...");
    setSupabaseError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });
    if (error) {
      setStatus("");
      setSupabaseError(error.message);
    }
    setStatus("");
  };
  return (
    <main>
      <Link className="home-link" to="/">
        Home
      </Link>
      <form className="main-container" onSubmit={handleSubmit}>
        <h1 className="header-text">Sign In</h1>
        <input
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && (
          <p id="email-error" style={{ justifyContent: "left", color: "red", marginTop: "0.25rem" }}>
            {errors.email}
          </p>
        )}
        <input
          name="password"
          onChange={handleInputChange}
          type="password"
          placeholder="Password"
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
        />
        {errors.password && (
          <p id="password-error" style={{ justifyContent: "left", color: "red", marginTop: "0.25rem" }}>
            {errors.password}
          </p>
        )}
        <button type="submit">Login</button>
        {supabaseError && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{supabaseError}</p>
        )}
        <Link className="auth-link" to="/auth/sign-up">
          Don't have an account? Sign Up
        </Link>
        {status && <p>{status}</p>}
      </form>
    </main>
  );
};

export default SignInPage;
