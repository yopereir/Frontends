import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY, STRIPE_PRICING_TABLE_DARKTHEME, STRIPE_PRICING_TABLE_LIGHTTHEME } from "../../config";
import "./SubscriptionPage.css";

const SubscriptionPage = () => {
  const { session, theme } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/auth/sign-in");
    }
  }, [session, navigate]);

  const [status, setStatus] = useState("");
  const [supabaseError, setSupabaseError] = useState("");

  const [formValues, setFormValues] = useState({
    email: "",
    name: "",
    location: "",
    password: "",
    subscriptionType: "",
    subscriptionPeriod: "",
    autoRenew: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [subscriptionTypes, setSubscriptionTypes] = useState<{ name: string; description: string; prices: any }[]>([]);

  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      const { data } = await supabase.from("subscription_type").select("name, description, prices");
      if (data) {
        setSubscriptionTypes(data.map((item: any) => ({ name: item.name, description: item.description, prices: item.prices })));
      } else {
        setSupabaseError("Failed to load subscription types.");
      }
    };
    fetchSubscriptionTypes();
  }, []);

  const handleButtonClick = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (supabaseError) {
      setSupabaseError("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (supabaseError) {
      setSupabaseError("");
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!session) {
      if (!formValues.email.trim()) newErrors.email = "Email is required.";
      if (!formValues.password.trim()) newErrors.password = "Password is required.";
    }

    if (!formValues.subscriptionType) newErrors.subscriptionType = "Subscription type is required.";
    if (!formValues.subscriptionPeriod) newErrors.subscriptionPeriod = "Subscription period is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isLoading = status !== "";
  console.log(subscriptionTypes);
  const selectedSubscriptionType = subscriptionTypes.find(
    (type) => type.name === formValues.subscriptionType
  );
  const selectedSubscriptionTypeDescription = selectedSubscriptionType?.description || "";
  // INFO: decided to not show price here, to avoid running a server side function to get Stripe price, when it is shown on the next page anyway.
  const selectedPrice = "N/A" //|| selectedSubscriptionType?.prices?.[formValues.subscriptionPeriod.toLowerCase()];

  return (
    <main>
      <Link className="home-link" to="/">Home</Link>
      <form className="main-container" noValidate>
        <h1 className="header-text">Subscription</h1>
        {React.createElement('stripe-pricing-table', {
          'pricing-table-id': STRIPE_PRICING_TABLE_LIGHTTHEME,
          'publishable-key': STRIPE_PUBLISHABLE_KEY,
          'customer-email': session?.user?.email || "",
          ...(formValues.autoRenew && { 'auto-renew': "true" }),
        })}
        {supabaseError && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{supabaseError}</p>
        )}

        {status && (
          <p style={{ textAlign: "center", marginTop: "1rem", color: "#555" }}>
            {status}
          </p>
        )}
      </form>
    </main>
  );
};

export default SubscriptionPage;
