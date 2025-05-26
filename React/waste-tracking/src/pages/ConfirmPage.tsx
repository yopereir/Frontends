import { useEffect, useState } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import supabase from "../supabase";

const ConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const [redirect, setRedirect] = useState(false);
  const { session } = useSession();

  useEffect(() => {
    const verifyEmail = async () => {
      const type = searchParams.get("type");
      const accessToken = searchParams.get("access_token");

      if (type === "signup" && accessToken) {
        try {
          // Try to refresh the session (if needed)
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (error || !data?.user) {
            setStatus("Verification failed or link is invalid.");
            return;
          }
          setStatus("Email successfully verified!");
          setTimeout(() => setRedirect(true), 2000);
        } catch (err) {
          setStatus("An error occurred during verification.");
        }
      } else {
        setStatus("Invalid confirmation link.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (redirect || session) return <Navigate to="/dashboard" />;

  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">Email Verification</h1>
        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>{status}</p>
        <Link to="/">Return to Home</Link>
      </section>
    </main>
  );
};

export default ConfirmPage;
