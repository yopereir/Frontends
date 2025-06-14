import { Link } from "react-router-dom";
// TODO: implement actual subscription logic and UI

const SubscriptionPage: React.FC = () => {
  return (
    <main>
      <section className="main-container">
        <h1 className="header-text">This is the Subscription page</h1>
        <Link to="/">Go back to Home</Link>
      </section>
    </main>
  );
};

export default SubscriptionPage;
