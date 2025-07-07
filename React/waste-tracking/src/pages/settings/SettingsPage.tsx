import { useSession } from "../../context/SessionContext";
import HeaderBar from "../../components/HeaderBar";
import React, { useState, useEffect, useCallback } from 'react';
import supabase from "../../supabase";
import './SettingsPage.css';
import AddItemDialog, { unitOptions } from "../../components/AddItemDialog";
import AddRestaurantDialog from "../../components/AddRestaurantDialog";
import { Link } from "react-router-dom";

// Props for the EditableField component
type EditableFieldProps = {
  label: string;
  initialValue: string | number;
  onSave: (newValue: string | number) => Promise<void> | void; // Can be async
  fieldType?: 'text' | 'email' | 'password' | 'number' | 'select'; // Add 'select' type
  fieldId: string; // For label htmlFor
  selectOptions?: string[]; // New prop for select options
};

const EditableField: React.FC<EditableFieldProps> = ({ label, initialValue, onSave, fieldType = 'text', fieldId, selectOptions }) => {
  // Ensure initialValue is treated consistently as a string for direct comparison
  // This helps when initialValue might be a number like 0, and input is "0"
  const [value, setValue] = useState(String(initialValue));
  const [currentInitialValue, setCurrentInitialValue] = useState(String(initialValue)); // Keep track of the *current* initial value as a string
  const [isDirty, setIsDirty] = useState(false); // Tracks if the field has been changed
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // State to hold save error messages

  // Local state for combined select options (unitOptions + initialValue if unique)
  const [currentSelectOptions, setCurrentSelectOptions] = useState<string[]>([]);

  // Update internal state if initialValue prop changes (e.g., after a parent-led data refresh)
  useEffect(() => {
    setValue(String(initialValue));
    setCurrentInitialValue(String(initialValue)); // Update the reference initial value
    setIsDirty(false); // Reset dirty state when initialValue changes
  }, [initialValue]);

  // Effect to manage select options
  useEffect(() => {
    if (fieldType === 'select' && selectOptions) {
      const optionsSet = new Set(selectOptions);
      // If initialValue is not in the provided selectOptions, add it
      if (typeof initialValue === 'string' && initialValue && !optionsSet.has(initialValue)) {
        setCurrentSelectOptions([initialValue, ...selectOptions]); // Add initialValue at the beginning
      } else {
        setCurrentSelectOptions(selectOptions);
      }
    }
  }, [fieldType, selectOptions, initialValue]);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    // Compare the new string value with the current string representation of the initial value
    setIsDirty(newValue !== currentInitialValue);

    if (error) { setError(null); } // Clear error when user starts typing
  };

  const handleSave = async () => {
    if (!isDirty) return; // Don't save if not changed

    setIsSaving(true);
    setError(null);
    try {
      await onSave(value); // onSave expects string | number, value is string, will be parsed later if needed
      setIsDirty(false); // Reset dirty state after successful save
      // After a successful save, update currentInitialValue to the new saved value
      setCurrentInitialValue(value);
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
          {fieldType === 'select' ? (
            <select
              id={fieldId}
              value={value}
              onChange={handleChange}
              className={`unit-select ${isDirty ? 'input-dirty' : ''}`}
              disabled={isSaving}
            >
              {currentSelectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={fieldType}
              id={fieldId}
              value={value}
              onChange={handleChange}
              className={isDirty ? 'input-dirty' : ''}
              disabled={isSaving}
            />
          )}
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
  const [itemDeleteErrors, setItemDeleteErrors] = useState<{[key: string]: string | null}>({});

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
      case 'unit': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {unit: newValue}}));break;
      case 'holdingtime':
        const newValueString = newValue.toString(); // Ensure we're working with a string
        const parsedHoldingTime = parseInt(newValueString);
        if (newValueString !== '' && (isNaN(parsedHoldingTime) || parsedHoldingTime < 0)) {
          throw new Error("Holding Time must be 0 or a positive number.");
        }
        ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {"holdMinutes": newValueString === '' ? null : parsedHoldingTime}}));
        break;
      case 'imageUrl': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {imageUrl: newValue}}));break;
      case 'tags': ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {tags: newValue.toString().toLowerCase().split(',').map(tag => tag.trim()).filter(Boolean)}}));break;
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

  const handleDeleteItem = async (itemId: string) => {
    // Clear any previous error for this item
    setItemDeleteErrors(prev => ({ ...prev, [itemId]: null }));

    if (!session?.user) {
      setItemDeleteErrors(prev => ({ ...prev, [itemId]: "User not authenticated." }));
      return;
    }

    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error deleting item:", error.message);
        setItemDeleteErrors(prev => ({ ...prev, [itemId]: `Failed to delete item: ${error.message}` }));
      } else {
        console.log(`Item ${itemId} deleted successfully.`);
        // Re-fetch settings to update the UI after deletion
        fetchSettings();
      }
    } catch (err: any) {
      console.error("An unexpected error occurred during deletion:", err);
      setItemDeleteErrors(prev => ({ ...prev, [itemId]: `An unexpected error occurred: ${err.message || String(err)}` }));
    }
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
        setItemsSettings(
          itemsData.map((itemData) => ({
            id: itemData.id,
            name: itemData.name,
            // Ensure holdMinutes is a string for the initialValue of EditableField
            holdMinutes: itemData.metadata.holdMinutes !== null ? String(itemData.metadata.holdMinutes) : "",
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
              <div key={restaurantData.id} className="restaurant-setting"> {/* Use unique ID for key */}
                <h3>Restaurant {index + 1}</h3>
                <EditableField
                  fieldId={`name-${restaurantData.id}`}
                  label="Name"
                  initialValue={restaurantData.name}
                  onSave={handleSaveRestaurantSetting('name', restaurantData.id)}
                />
                <EditableField
                  fieldId={`location-${restaurantData.id}`}
                  label="Location"
                  initialValue={restaurantData.location}
                  onSave={handleSaveRestaurantSetting('location', restaurantData.id)}
                />
                <EditableField
                  fieldId={`subscription-${restaurantData.id}`}
                  label="Subscription"
                  initialValue={restaurantData.subscription}
                  onSave={handleSaveRestaurantSetting('subscription', restaurantData.id)}
                />
                <h2></h2>
                <h2>Item Settings</h2>
                { itemSettings.map((itemData) => (
                  itemData.restaurant_id === restaurantData.id &&
                  <div key={itemData.id} className="item-setting"> {/* Use unique ID for key */}
                    <EditableField
                      fieldId={`item-name-${itemData.id}`}
                      label="Item Name"
                      initialValue={itemData.name}
                      onSave={handleSaveItemSetting('name', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-restaurant-${itemData.id}`}
                      label="Restaurant ID"
                      initialValue={itemData.restaurant_id}
                      onSave={handleSaveItemSetting('restaurant_id', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-unit-${itemData.id}`}
                      label="Unit"
                      initialValue={itemData.unit}
                      onSave={handleSaveItemSetting('unit', itemData.id)}
                      fieldType="select" // Specify fieldType as 'select'
                      selectOptions={unitOptions} // Pass the unitOptions to the EditableField
                    />
                    <EditableField
                      fieldId={`item-holdingtime-${itemData.id}`}
                      label="Holdingtime"
                      initialValue={itemData.holdMinutes}
                      onSave={handleSaveItemSetting('holdingtime', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-imageUrl-${itemData.id}`}
                      label="Image URL"
                      initialValue={itemData.imageUrl}
                      onSave={handleSaveItemSetting('imageUrl', itemData.id)}
                    />
                    <EditableField
                      fieldId={`item-tags-${itemData.id}`}
                      label="Image Tags"
                      initialValue={itemData.tags}
                      onSave={handleSaveItemSetting('tags', itemData.id)}
                    />
                    <button
                      onClick={() => handleDeleteItem(itemData.id)}
                      className="delete-button" // Add a class for styling
                    >
                      Delete Item
                    </button>
                    {itemDeleteErrors[itemData.id] && (
                      <p style={{ color: "var(--error-color)", marginTop: "0.25rem", textAlign: 'center', width: '100%' }}>
                        {itemDeleteErrors[itemData.id]}
                      </p>
                    )}
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