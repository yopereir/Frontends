import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const SignUpPage = () => {
  const { session } = useSession();
  if (session) return <Navigate to="/" />;
  const [status, setStatus] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    name: "",
    location: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

    // Clear field error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
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
    const { error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          name: formValues.name,
          location: formValues.location,
        },
      },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email to confirm your account.");
    }
  };

  return (
    <main>
      <Link className="home-link" to="/">
        Home
      </Link>
      <form className="main-container" onSubmit={handleSubmit} noValidate>
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
          <p id="email-error" style={{ justifyContent: "left", color: "red", marginTop: "0.25rem" }}>
            {errors.email}
          </p>
        )}

        <input
          name="name"
          onChange={handleInputChange}
          type="text"
          placeholder="Full Name"
        />
        <input
          name="location"
          onChange={handleInputChange}
          type="address"
          placeholder="Address"
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
          <p id="password-error" style={{ justifyContent: "left", color: "red", marginTop: "0.25rem" }}>
            {errors.password}
          </p>
        )}

        <button type="submit">Create Account</button>

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
