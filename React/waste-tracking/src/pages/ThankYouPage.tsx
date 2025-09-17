// ThankYouPage.tsx
import { Link, useSearchParams } from "react-router-dom";

const messageDigest = {
  "new-signup":"Thank you for signing up! You should receive a confirmation email in your inbox. You can now add any subscriptions you want from the Settings page from the Main menu.",
  "new-subscriber":"Thank you for subscribing!",
  "renew-subscriber":"Thank you for renewing your subscription!",
  "":"You reached our thank you page for no reason at all :P",
};

type MessageKey = keyof typeof messageDigest;

const ThankYouPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const messageKey = (searchParams.get("message") || "") as MessageKey;
  const message = messageDigest[messageKey];

  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">Thank You</h1>
        <div style={{ marginTop: "1rem", fontSize: "1rem" }}>
          {message ? <p>{message}</p> : <p>Your action was successful.</p>}
        </div>
        <Link to="/" style={{ marginTop: "2rem", width: "fit-content" }}>
          Go to Homepage
        </Link>
      </section>
    </main>
  );
};

export default ThankYouPage;
