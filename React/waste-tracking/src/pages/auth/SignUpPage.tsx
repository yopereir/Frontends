import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const SignUpPage = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  if (session) return <Navigate to="/" />;

  const [status, setStatus] = useState("");
  const [supabaseError, setSupabaseError] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    name: "",
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

    setStatus("Creating account...");
    setSupabaseError("");

    const { error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          name: formValues.name,
        },
      },
    });

    if (error) {
      setStatus("");
      setSupabaseError(error.message);
    } else {
      navigate("/dialog?message=new-signup", {
        state: {
          message: "Your account has been created. Please check your email to confirm your account.",
        }
      });
    }
  };

  return (
    <main>
      <Link className="home-link" to="/">
        Home
      </Link>
      <form style={{width:"50%"}} className="main-container" onSubmit={handleSubmit} noValidate>
        <h1 className="header-text">Sign Up</h1>
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#777" }}>
          Please fill in the details below to create a new account.
        </p>

        <input
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && (
          <p id="email-error" style={{ color: "red", marginTop: "0.25rem" }}>
            {errors.email}
          </p>
        )}

        <input
          name="name"
          onChange={handleInputChange}
          type="text"
          placeholder="Name"
        />

        <input
          name="password"
          onChange={handleInputChange}
          type="password"
          placeholder="Password"
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
        />
        {errors.password && (
          <p id="password-error" style={{ color: "red", marginTop: "0.25rem" }}>
            {errors.password}
          </p>
        )}

        <button type="submit">Create Account</button>

        {supabaseError && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{supabaseError}</p>
        )}

        <Link className="auth-link" to="/auth/sign-in">
          Already have an account? Sign In
        </Link>

        {status && (
          <p style={{ textAlign: "center", marginTop: "1rem", color: "#555" }}>
            {status}
          </p>
        )}
      </form>
    </main>
  );
};

export default SignUpPage;
