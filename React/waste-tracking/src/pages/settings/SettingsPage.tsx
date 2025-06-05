import { Link } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import HeaderBar from "../../components/HeaderBar";
import React, { useState, useEffect } from 'react';
import supabase from "../../supabase"; // Make sure supabase is imported if you use it in save handlers
import './SettingsPage.css'; // We'll create this file for specific styles

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

  // Update internal state if initialValue prop changes (e.g., after a parent-led data refresh)
  useEffect(() => {
    setValue(initialValue);
    setIsDirty(false); // Reset dirty state when initialValue changes
  }, [initialValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setIsDirty(event.target.value !== initialValue);
  };

  const handleSave = async () => {
    if (!isDirty) return; // Don't save if not changed

    setIsSaving(true);
    try {
      await onSave(value);
      setIsDirty(false); // Reset dirty state after successful save
      // Optionally, you might want to update initialValue here or rely on parent to re-fetch/pass new prop
    } catch (error) {
      console.error("Failed to save setting:", error);
      // Handle error (e.g., show a notification to the user)
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
  );
};

const SettingsPage = () => {
  const { session } = useSession();

  // --- Save Handlers ---
  // Replace these with your actual Supabase (or other backend) update logic.

  const handleSaveUserSetting = (fieldName: string) => async (newValue: string | number) => {
    console.log(`Attempting to save User Setting - ${fieldName}: ${newValue}`);
    if (!session?.user) {
      console.error("User not authenticated");
      return;
    }
    // Example: Updating user_metadata
    // const { data, error } = await supabase.auth.updateUser({
    //   data: { [fieldName]: newValue }
    // });
    // if (error) console.error(`Error saving ${fieldName}:`, error.message);
    // else console.log(`${fieldName} updated successfully:`, data);

    // For email, it's slightly different:
    // if (fieldName === 'email' && typeof newValue === 'string') {
    //   const { data, error } = await supabase.auth.updateUser({ email: newValue });
    // }

    // For password changes, it's:
    // if (fieldName === 'password' && typeof newValue === 'string') {
    //   const { data, error } = await supabase.auth.updateUser({ password: newValue });
    // }
    alert(`Simulated save for User - ${fieldName}: ${newValue}`); // Placeholder
  };

  const handleSaveItemSetting = (fieldName: string) => async (newValue: string | number) => {
    console.log(`Attempting to save Item Setting - ${fieldName}: ${newValue}`);
    // Example: Update a 'item_settings' table
    // const { data, error } = await supabase
    //   .from('item_settings')
    //   .update({ [fieldName]: newValue })
    //   .eq('user_id', session.user.id); // Or some other relevant identifier
    // if (error) console.error(`Error saving ${fieldName}:`, error.message);
    // else console.log(`${fieldName} updated successfully:`, data);
    alert(`Simulated save for Item - ${fieldName}: ${newValue}`); // Placeholder
  };

  const handleSaveRestaurantSetting = (fieldName: string) => async (newValue: string | number) => {
    console.log(`Attempting to save Restaurant Setting - ${fieldName}: ${newValue}`);
    // Example: Update a 'restaurant_settings' table
    // const { data, error } = await supabase
    //   .from('restaurant_settings')
    //   .update({ [fieldName]: newValue })
    //   .eq('user_id', session.user.id); // Or some other relevant identifier
    // if (error) console.error(`Error saving ${fieldName}:`, error.message);
    // else console.log(`${fieldName} updated successfully:`, data);
    alert(`Simulated save for Restaurant - ${fieldName}: ${newValue}`); // Placeholder
  };


  // --- Example Initial Values ---
  // In a real app, you'd fetch these from your backend/Supabase when the component mounts.
  const [userSettings, setUserSettings] = useState({
    username: session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || "User",
    email: session?.user?.email || "",
  });
  const [itemSettings, setItemSettings] = useState({
    defaultUnit: "kg",
    lowStockThreshold: 10,
  });
  const [restaurantSettings, setRestaurantSettings] = useState({
    restaurantName: "My Waste Tracker",
    address: "123 Green Way",
    currency: "USD",
  });

  // useEffect to fetch actual settings if needed
  // useEffect(() => {
  //   const fetchSettings = async () => {
  //     if (session?.user) {
  //       // Fetch user settings (e.g., from a 'profiles' table or user_metadata)
  //       // setUserSettings({ email: session.user.email, username: session.user.user_metadata.username || ''});
  //
  //       // Fetch item settings
  //       // const { data: itemData } = await supabase.from('item_settings').select('*').eq('user_id', session.user.id).single();
  //       // if (itemData) setItemSettings(itemData);
  //
  //       // Fetch restaurant settings
  //       // const { data: restaurantData } = await supabase.from('restaurant_settings').select('*').eq('user_id', session.user.id).single();
  //       // if (restaurantData) setRestaurantSettings(restaurantData);
  //     }
  //   };
  //   fetchSettings();
  // }, [session]);


  return (
    <div className="home-page"> {/* Using home-page class for consistent page structure */}
      <HeaderBar />
      <Link className="home-link" to="/">
        ◄ Home
      </Link>
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

          {/* Item Settings */}
          <section className="settings-category">
            <h2>Item Settings</h2>
            <EditableField
              fieldId="defaultUnit"
              label="Default Item Unit"
              initialValue={itemSettings.defaultUnit}
              onSave={handleSaveItemSetting('defaultUnit')}
            />
            <EditableField
              fieldId="lowStockThreshold"
              label="Low Stock Threshold"
              initialValue={itemSettings.lowStockThreshold}
              onSave={handleSaveItemSetting('lowStockThreshold')}
              fieldType="number"
            />
          </section>

          {/* Restaurant Settings */}
          <section className="settings-category">
            <h2>Restaurant Settings</h2>
            <EditableField
              fieldId="restaurantName"
              label="Restaurant Name"
              initialValue={restaurantSettings.restaurantName}
              onSave={handleSaveRestaurantSetting('restaurantName')}
            />
            <EditableField
              fieldId="address"
              label="Address"
              initialValue={restaurantSettings.address}
              onSave={handleSaveRestaurantSetting('address')}
            />
             <EditableField
              fieldId="currency"
              label="Currency Symbol"
              initialValue={restaurantSettings.currency}
              onSave={handleSaveRestaurantSetting('currency')}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;