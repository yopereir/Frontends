import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const SignInPage = () => {
  const { session } = useSession();
  if (session) return <Navigate to="/" />;

  const [status, setStatus] = useState("");
  const [supabaseError, setSupabaseError] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }

    if (supabaseError) {
      setSupabaseError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!formValues.email.trim()) newErrors.email = "Email is required.";
    if (!forgotPasswordMode && !formValues.password.trim())
      newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus(forgotPasswordMode ? "Sending reset email..." : "Logging in...");
    setSupabaseError("");

    if (forgotPasswordMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(formValues.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        setStatus("");
        setSupabaseError(error.message);
      } else {
        setStatus("Reset link sent! Check your email.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });

    if (error) {
      setStatus("");
      setSupabaseError(error.message);
    } else {
      setStatus("Logged in!");
    }
  };

  return (
    <main>
      <Link className="home-link" to="/">Home</Link>
      <form className="main-container" onSubmit={handleSubmit}>
        <h1 className="header-text">{forgotPasswordMode ? "Reset Password" : "Sign In"}</h1>

        <input
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          value={formValues.email}
        />
        {errors.email && (
          <p id="email-error" style={{ color: "red", marginTop: "0.25rem" }}>{errors.email}</p>
        )}

        {!forgotPasswordMode && (
          <>
            <input
              name="password"
              onChange={handleInputChange}
              type="password"
              placeholder="Password"
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              value={formValues.password}
            />
            {errors.password && (
              <p id="password-error" style={{ color: "red", marginTop: "0.25rem" }}>{errors.password}</p>
            )}
          </>
        )}

        <p>
          <button
            type="button"
            style={{ background: "none", border: "none", color: "var(--button-color)", cursor: "pointer", padding: 0 }}
            onClick={() => {
              setForgotPasswordMode(!forgotPasswordMode);
              setStatus("");
              setSupabaseError("");
              setErrors({});
            }}
          >
            {forgotPasswordMode ? "Back to Sign In" : "Forgot Password?"}
          </button>
        </p>
        <button type="submit">{forgotPasswordMode ? "Reset Password" : "Login"}</button>

        {supabaseError && <p style={{ color: "red", marginTop: "0.5rem" }}>{supabaseError}</p>}
        {status && <p>{status}</p>}

        {!forgotPasswordMode && (
          <Link className="auth-link" to="/auth/sign-up">
            Don't have an account? Sign Up
          </Link>
        )}

      </form>
    </main>
  );
};

export default SignInPage;
