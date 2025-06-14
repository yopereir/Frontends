import { useSession } from "../../context/SessionContext";
import HeaderBar from "../../components/HeaderBar";
import React, { useState, useEffect, useCallback } from 'react';
import supabase from "../../supabase"; // Make sure supabase is imported if you use it in save handlers
import './SettingsPage.css';
import AddItemDialog from "../../components/AddItemDialog";
import AddRestaurantDialog from "../../components/AddRestaurantDialog";
import { Link } from "react-router-dom";

// Props for the EditableField component
type EditableFieldProps = {
  label: string;
  initialValue: string | number;
  onSave: (newValue: string | number) => Promise<void> | void; // Can be async
  fieldType?: 'text' | 'email' | 'password' | 'number';
  fieldId: string; // For label htmlFor
};

const EditableField: React.FC<EditableFieldProps> = ({ label, initialValue, onSave, fieldType = 'text', fieldId }) => {
  const [value, setValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false); // Tracks if the field has been changed
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // State to hold save error messages

  // Update internal state if initialValue prop changes (e.g., after a parent-led data refresh)
  useEffect(() => {
    setValue(initialValue);
    setIsDirty(false); // Reset dirty state when initialValue changes
  }, [initialValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setIsDirty(event.target.value !== initialValue);
    if (error) { setError(null); } // Clear error when user starts typing
  };

  const handleSave = async () => {
    if (!isDirty) return; // Don't save if not changed

    setIsSaving(true);
    setError(null);
    try {
      await onSave(value);
      setIsDirty(false); // Reset dirty state after successful save
      // Optionally, you might want to update initialValue here or rely on parent to re-fetch/pass new prop
    } catch (error: any) {
      console.error("Failed to save setting:", error);
      // Handle error (e.g., show a notification to the user)
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="setting-field">
        <label htmlFor={fieldId}>{label}:</label>
        <div className="input-with-button">
          <input
            type={fieldType}
            id={fieldId}
            value={value}
            onChange={handleInputChange}
            className={isDirty ? 'input-dirty' : ''}
          />
          {isDirty && (
            <button onClick={handleSave} className="save-button" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
      {error && <p style={{ color: "var(--error-color)", marginTop: "0.25rem", textAlign: 'left', width: '100%' }}>{error}</p>}
    </>
  );
};

const SettingsPage = () => {
  const { session } = useSession();
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isAddRestaurantDialogOpen, setAddRestaurantDialogOpen] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>("");

  const handleSaveUserSetting = (fieldName: string) => async (newValue: string | number) => {
    console.log(`Attempting to save User Setting - ${fieldName}: ${newValue}`);
    if (!session?.user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    let error;
    switch (fieldName) {
      case 'username': ({ error } = await supabase.auth.updateUser({data: { username: newValue }}));
        break;
      case 'email': ({ error } = await supabase.auth.updateUser({ email: newValue.toString() }));
        break;
      case 'password': ({ error } = await supabase.auth.updateUser({password: newValue.toString() }));
        break;
      default:
        throw new Error(`Unknown user setting: ${fieldName}`);
    }
    if (error) {
      console.error(`Error saving ${fieldName}:`, error.message);
      throw new Error(`Failed to update ${fieldName}. `+error.message);
    }
    console.log(`${fieldName} updated successfully.`);
  };

  const handleSaveSubscriptionSetting = (fieldName: string) => async (newValue: string | number) => {
    console.log(`Attempting to save Subscription Setting - ${fieldName}: ${newValue}`);
    if (!session?.user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    let error;
    switch (fieldName) {
      case 'endDate': ({ error } = await supabase.from('subscriptions').update({endDate: newValue}));break;
      case 'plan': ({ error } = await supabase.from('subscriptions').update({plan: newValue}));break;
      case 'status': ({ error } = await supabase.from('subscriptions').update({status: newValue}));break;
      default:
        throw new Error(`Unknown subscription setting: ${fieldName}`);
    }
    if (error) {
      console.error(`Error saving ${fieldName}:`, error.message);
      throw new Error(`Failed to update ${fieldName}. `+error.message);
    }
    console.log(`${fieldName} updated successfully.`);
  };

  const handleSaveItemSetting = (fieldName: string, itemId: string) => async (newValue: string | number) => {
    console.log(`Attempting to save Item Setting - ${fieldName}: ${newValue}`);
    if (!session?.user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    let error;
    switch (fieldName) {
      case 'name': ({ error } = await supabase.from('items').update({name: newValue}).eq('id', itemId));break;
      case 'restaurant_id': ({ error } = await supabase.from('items').update({restaurant_id: newValue}).eq('id', itemId));break
      case 'unit': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {[fieldName]: fieldName === 'unit' ? newValue : newValue}}));break;
      case 'holdingtime': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {"holdMinutes": newValue}}));break;
      case 'imageUrl': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {[fieldName]: fieldName === 'imageUrl' ? newValue : newValue}}));break;
      case 'tags': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {[fieldName]: fieldName === 'tags' ? newValue.toString().split(',') : newValue}}));break;
      default:
        throw new Error(`Unknown item setting: ${fieldName}`);
    }
    if (error) {
      console.error(`Error saving ${fieldName}:`, error.message);
      throw new Error(`Failed to update ${fieldName}. `+error.message);
    }
    console.log(`${fieldName} updated successfully.`);
  };

  const handleSaveRestaurantSetting = (fieldName: string, restaurantId: string) => async (newValue: string | number) => {
    console.log(`Attempting to save Restaurant Setting - ${fieldName}: ${newValue}`);
    if (!session?.user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    let error;
    switch (fieldName) {
      case 'name': ({ error } = await supabase.from('restaurants').update({name: newValue}).eq('id', restaurantId));break;
      case 'location': ({ error } = await supabase.from('restaurants').update({location: newValue}).eq('id', restaurantId));break;
      case 'subscription': ({ error } = await supabase.from('restaurants').update({subscription_id: newValue}).eq('id', restaurantId));break;
      default:
        throw new Error(`Unknown item setting: ${fieldName}`);
    }
    if (error) {
      console.error(`Error saving ${fieldName}:`, error.message);
      throw new Error(`Failed to update ${fieldName}. `+error.message);
    }
    console.log(`${fieldName} updated successfully.`);
  };


  // --- Example Initial Values ---
  // In a real app, you'd fetch these from your backend/Supabase when the component mounts.
  const [userSettings, setUserSettings] = useState({
    username: session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || "User",
    email: session?.user?.email || "",
  });
  const [subscriptionSettings, setSubscriptionSettings] = useState({
    id: "",
    endDate: "00-00-00",
    status: "ended",
    plan: "all",
  });
  const [restaurantSettings, setRestaurantsSettings] = useState([{
    id: "",
    name: "My Waste Tracker",
    location: "123 Green Way",
    subscription: "USD",
  }]);
  const [itemSettings, setItemsSettings] = useState([{
    id: "",
    name: "Default Item",
    holdMinutes: "30",
    restaurant_id: "",
    unit: "kg",
    imageUrl: "",
    tags: ""
  }]);

  const fetchSettings = useCallback(async () => {
    if (session?.user) {
      //Fetch user settings (e.g., from a 'profiles' table or user_metadata)
      setUserSettings({ email: session.user.email || '', username: session.user.user_metadata.username || ''});

      //Fetch subscription settings
      const { data: subscriptionData } = await supabase.from('subscriptions').select('*').single();
      if (subscriptionData) setSubscriptionSettings({ id: subscriptionData.id, endDate: subscriptionData.end_date, status: subscriptionData.status, plan: subscriptionData.plan });

      //Fetch restaurant settings
      const { data: restaurantsData } = await supabase.from('restaurants').select('*');
      if (restaurantsData) {
        setRestaurantsSettings([]); // Reset before adding new data
        setRestaurantsSettings(
          restaurantsData.map((restaurantData) => ({
            id: restaurantData.id,
            name: restaurantData.name,
            location: restaurantData.location,
            subscription: restaurantData.subscription_id
          }))
        );
      }

      //Fetch item settings
      const { data: itemsData } = await supabase.from('items').select('*');
      if (itemsData) {
        setItemsSettings([]); // Reset before adding new data
        setItemsSettings(
          itemsData.map((itemData) => ({
            id: itemData.id,
            name: itemData.name,
            holdMinutes: itemData.metadata.holdMinutes,
            restaurant_id: itemData.restaurant_id,
            unit: itemData.metadata.unit,
            imageUrl: itemData.metadata.imageUrl,
            tags: itemData.metadata?.tags?.toString() || ""
          }))
        );
      }
    }
  }, [session]);

  //useEffect to fetch actual settings if needed
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  return (
    <>
    <div className="home-page"> {/* Using home-page class for consistent page structure */}
      <HeaderBar />
      <main className="main-container settings-container">
        <h1 className="header-text" style={{ width: '100%', justifyContent: 'center' }}>Settings</h1>
        <p style={{ width: '100%', textAlign: 'center', color: 'var(--menu-text)', marginBottom: '1.5rem' }}>
          Current User : {session?.user.email || "None"}
        </p>

        <div className="settings-categories-wrapper">
          {/* User Settings */}
          <section className="settings-category">
            <h2>User Settings</h2>
            <EditableField
              fieldId="username"
              label="Username"
              initialValue={userSettings.username}
              onSave={handleSaveUserSetting('username')}
            />
            <EditableField
              fieldId="email"
              label="Email"
              initialValue={userSettings.email}
              onSave={handleSaveUserSetting('email')}
              fieldType="email"
            />
            <EditableField
              fieldId="password"
              label="New Password"
              initialValue="" // Password fields typically start empty
              onSave={handleSaveUserSetting('password')}
              fieldType="password"
            />
          </section>

          {/* Subscription Settings */}
          <section className="settings-category">
            <h2>Subscription Settings</h2>
            <EditableField
              fieldId="endDate"
              label="Subscription End Date"
              initialValue={subscriptionSettings.endDate}
              onSave={handleSaveSubscriptionSetting('endDate')}
            />
            <EditableField
              fieldId="plan"
              label="Subscription plan"
              initialValue={subscriptionSettings.plan}
              onSave={handleSaveSubscriptionSetting('plan')}
            />
            <EditableField
              fieldId="status"
              label="Subscription Status"
              initialValue={subscriptionSettings.status}
              onSave={handleSaveSubscriptionSetting('status')}
            />
            <Link to="/subscription">Update Subscription</Link>
          </section>

          {/* Restaurant Settings */}
          <section className="settings-category">
            <h2>Restaurant Settings</h2>
            { restaurantSettings.map((restaurantData, index) => (
              <div key={index} className="restaurant-setting">
                <h3>Restaurant {index + 1}</h3>
                <EditableField
                  fieldId={`name-${index}`}
                  label="Name"
                  initialValue={restaurantData.name}
                  onSave={handleSaveRestaurantSetting('name', restaurantData.id)}
                />
                <EditableField
                  fieldId={`location-${index}`}
                  label="Location"
                  initialValue={restaurantData.location}
                  onSave={handleSaveRestaurantSetting('location', restaurantData.id)}
                />
                <EditableField
                  fieldId={`subscription-${index}`}
                  label="Subscription"
                  initialValue={restaurantData.subscription}
                  onSave={handleSaveRestaurantSetting('subscription', restaurantData.id)}
                />
                <h2></h2>
                <h2>Item Settings</h2>
                { itemSettings.map((itemData, itemIndex) => (
                  itemData.restaurant_id === restaurantData.id &&
                  <div key={itemIndex} className="item-setting">
                    <EditableField
                      fieldId={`item-name-${itemIndex}`}
                      label="Item Name"
                      initialValue={itemData.name}
                      onSave={handleSaveItemSetting('name', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-restaurant-${itemIndex}`}
                      label="Restaurant ID"
                      initialValue={itemData.restaurant_id}
                      onSave={handleSaveItemSetting('restaurant_id', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-unit-${itemIndex}`}
                      label="Unit"
                      initialValue={itemData.unit}
                      onSave={handleSaveItemSetting('unit', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-holdingtime-${itemIndex}`}
                      label="Holdingtime"
                      initialValue={itemData.holdMinutes}
                      onSave={handleSaveItemSetting('holdingtime', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-imageUrl-${itemIndex}`}
                      label="Image URL"
                      initialValue={itemData.imageUrl}
                      onSave={handleSaveItemSetting('imageUrl', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-tags-${itemIndex}`}
                      label="Image Tags"
                      initialValue={itemData.tags}
                      onSave={handleSaveItemSetting('tags', itemData.id)}
                    />
                    <h2></h2>
                  </div>
                ))}
              <button onClick={() => {setActiveRestaurantId(restaurantData.id);setAddItemDialogOpen(true)}}>Add New Item</button>
              <h2></h2>
              </div>
            ))}
            <button onClick={() => {setAddRestaurantDialogOpen(true)}}>Add New Restaurant</button>
          </section>
        </div>
      </main>
    </div>
    {isAddItemDialogOpen && (
      <AddItemDialog
          onClose={() => setAddItemDialogOpen(false)}
          onItemAdded={() => {
              fetchSettings();
              setAddItemDialogOpen(false);
          }}
          restaurantId={activeRestaurantId}
      />
    )}
    {isAddRestaurantDialogOpen && (
      <AddRestaurantDialog
          onClose={() => setAddRestaurantDialogOpen(false)}
          onRestaurantAdded={() => {
              fetchSettings();
              setAddRestaurantDialogOpen(false);
          }}
          subscriptionId={subscriptionSettings.id}
      />
    )}
    </>
  );
};

export default SettingsPage;