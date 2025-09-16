import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_ID_ALL_SUBSCRIPTION } from "../../config";
import "./SubscriptionPage.css";

const SubscriptionPage = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/auth/signin");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseError("");

    if (!validate()) return;
    console.log("Current userid: ", session?.user.id);

    try {
      setStatus("Creating account...");

      if (!session) {
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

        if (error) throw new Error(error.message);
      }

      setStatus("Redirecting to checkout...");

      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

      if (!stripe) {
        throw new Error("Failed to load Stripe.");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        lineItems: [{ price: STRIPE_PRICE_ID_ALL_SUBSCRIPTION, quantity: 1 }],
        mode: "subscription",
        successUrl: `${window.location.origin}/`,
        cancelUrl: `${window.location.origin}/subscription`,
        customerEmail: session?.user.email,
      });

      if (stripeError) {
        throw new Error(stripeError.message || "Stripe checkout failed.");
      }

    } catch (err: any) {
      setSupabaseError(err.message || "Unexpected error");
    } finally {
      setStatus("");
    }
  };

  const isLoading = status !== "";
  console.log(subscriptionTypes);
  const selectedSubscriptionType = subscriptionTypes.find(
    (type) => type.name === formValues.subscriptionType
  );
  const selectedSubscriptionTypeDescription = selectedSubscriptionType?.description || "";
  const selectedPrice = selectedSubscriptionType?.prices?.[formValues.subscriptionPeriod.toLowerCase()] || "N/A";

  return (
    <main>
      <Link className="home-link" to="/">Home</Link>
      <form className="main-container" onSubmit={handleSubmit} noValidate>
        <h1 className="header-text">Subscription</h1>

        {!session && (
          <>
            <h2>User Details</h2>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleInputChange}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              disabled={isLoading}
            />
            {errors.email && <p id="email-error" style={{ color: "red" }}>{errors.email}</p>}

            <input name="name" type="text" placeholder="Full Name" onChange={handleInputChange} disabled={isLoading} />
            <input name="location" type="text" placeholder="Address" onChange={handleInputChange} disabled={isLoading} />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleInputChange}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              disabled={isLoading}
            />
            {errors.password && <p id="password-error" style={{ color: "red" }}>{errors.password}</p>}
            <br/>
            <h2>Subscription Details</h2>
            <br/>
          </>
        )}

        <div className="subscription-options-group">
          <h3>Subscription Type</h3>
          <div className="view-toggle-buttons">
            {subscriptionTypes.map((type) => (
              <button
                key={type.name}
                type="button"
                className={`toggle-button ${formValues.subscriptionType === type.name ? "active" : ""}`}
                onClick={() => handleButtonClick("subscriptionType", type.name)}
                disabled={isLoading}
              >
                {type.name}
              </button>
            ))}
          </div>
          {selectedSubscriptionTypeDescription && (
            <div className="subscription-description-text">
              {selectedSubscriptionTypeDescription}
            </div>
          )}
          {errors.subscriptionType && <p style={{ color: "red" }}>{errors.subscriptionType}</p>}
        </div>

        <div className="subscription-options-group">
          <h3>Subscription Period</h3>
          <div className="view-toggle-buttons">
            {["Monthly", "Yearly"].map((period) => (
              <button
                key={period}
                type="button"
                className={`toggle-button ${formValues.subscriptionPeriod === period ? "active" : ""}`}
                onClick={() => handleButtonClick("subscriptionPeriod", period)}
                disabled={isLoading}
              >
                {period}
              </button>
            ))}
          </div>
          {errors.subscriptionPeriod && <p style={{ color: "red" }}>{errors.subscriptionPeriod}</p>}
        </div>

        {selectedPrice !== "N/A" && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>Price: {selectedPrice}</div>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            name="autoRenew"
            checked={formValues.autoRenew}
            onChange={handleCheckboxChange}
            disabled={isLoading}
          />
          Auto-Renew Subscription
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Checkout"}
        </button>

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
