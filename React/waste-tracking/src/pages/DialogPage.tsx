// ThankYouPage.tsx
import { Link, useSearchParams } from "react-router-dom";

const messageDigest = {
  "new-signup":"You should receive a confirmation email in your inbox. After confirming you email, you can login and add Subscriptions.",
  "new-subscriber":"Thank you for subscribing!",
  "renew-subscriber":"Thank you for renewing your subscription!",
  "unauthorized-access":"You do not have the subscription required to use this service :(",
  "":"You reached our thank you page for no reason at all :P",
};

type MessageKey = keyof typeof messageDigest;

const DialogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const messageKey = (searchParams.get("message") || "") as MessageKey;
  const heading = (searchParams.get("heading") || "") as string;
  const message = messageDigest[messageKey];

  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">{heading || "Thank You"}</h1>
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

export default DialogPage;
