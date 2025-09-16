import React, { useEffect } from "react";
import HeaderBar from "../../components/HeaderBar";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import { STRIPE_PUBLISHABLE_KEY, STRIPE_PRICING_TABLE_DARKTHEME, STRIPE_PRICING_TABLE_LIGHTTHEME } from "../../config";
import "./SubscriptionPage.css";

const SubscriptionPage = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/auth/sign-in");
    }
  }, [session, navigate]);

  return (
    <main>
      <HeaderBar />
      <form className="main-container" noValidate>
        <h1 className="header-text">Subscription</h1>
        {React.createElement('stripe-pricing-table', {
          'pricing-table-id': document.documentElement.classList.contains('dark') ? STRIPE_PRICING_TABLE_DARKTHEME : STRIPE_PRICING_TABLE_LIGHTTHEME,
          'publishable-key': STRIPE_PUBLISHABLE_KEY,
          'customer-email': session?.user?.email || ""
        })}
      </form>
    </main>
  );
};

export default SubscriptionPage;
