// ThankYouPage.tsx
import { useLocation, Link } from "react-router-dom";

interface LocationState {
  message?: string;
}

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">Thank You</h1>
        <div style={{ marginTop: "1rem", fontSize: "1rem" }}>
          {state?.message ? <p>{state.message}</p> : <p>Your action was successful.</p>}
        </div>
        <Link to="/" style={{ marginTop: "2rem", display: "inline-block" }}>
          Go back to Home
        </Link>
      </section>
    </main>
  );
};

export default ThankYouPage;
