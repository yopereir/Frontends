import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const ResetPasswordPage = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setStatus("Updating password...");
    setError("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setStatus("");
      setError(error.message);
    } else {
      setStatus("Password updated. Redirecting...");
      setSubmitted(true);
    }
  };

  useEffect(() => {
    if (submitted) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [submitted, navigate]);

  // If user already has a session, they don’t need this page
  //if (session) return <Navigate to="/" />;

  return (
    <main>
      <Link className="home-link" to="/">Home</Link>
      <form className="main-container" onSubmit={handleSubmit}>
        <h1 className="header-text">Reset Password</h1>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          aria-invalid={!!error}
          aria-describedby="password-error"
        />
        {error && (
          <p id="password-error" style={{ color: "red", marginTop: "0.25rem" }}>{error}</p>
        )}
        <button type="submit">Reset Password</button>
        {status && <p>{status}</p>}
      </form>
    </main>
  );
};

export default ResetPasswordPage;
