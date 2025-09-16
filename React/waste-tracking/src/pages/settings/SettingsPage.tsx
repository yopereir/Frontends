import { useSession } from "../../context/SessionContext";
import HeaderBar from "../../components/HeaderBar";
import React, { useState, useEffect, useCallback } from 'react';
import supabase from "../../supabase";
import './SettingsPage.css';
import AddItemDialog, { unitOptions } from "../../components/AddItemDialog";
import AddRestaurantDialog from "../../components/AddRestaurantDialog";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../config";
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



type ItemTagsFieldProps = {
  itemId: string;
  initialTags: string[];
  onSave: (newTags: string[]) => Promise<void> | void;
};

type ItemCategoriesFieldProps = {
  label: string;
  fieldId: string;
  initialCategories: string[];
  onSave: (newCategories: string[]) => Promise<void> | void;
};

const ItemCategoriesField: React.FC<ItemCategoriesFieldProps> = ({ label, fieldId, initialCategories, onSave }) => {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
    setNewCategoryInput(initialCategories.join(', ')); // Initialize input with current categories
    setIsDirty(false);
  }, [initialCategories]);

  const handleCategoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setNewCategoryInput(inputValue);
    setIsDirty(inputValue !== initialCategories.join(', '));
    if (error) { setError(null); }
  };

  const handleSaveCategories = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    setError(null);
    try {
      const parsedCategories = newCategoryInput.split(',').map(category => category.trim()).filter(category => category !== '');
      await onSave(parsedCategories);
      setCategories(parsedCategories); // Update local state after successful save
      setIsDirty(false);
    } catch (err: any) {
      console.error("Failed to save categories:", err);
      setError(err.message || "Failed to update categories.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="setting-field">
      <label htmlFor={fieldId}>{label}:</label>
      <div className="input-with-button">
        <input
          id={fieldId}
          type="text"
          value={newCategoryInput}
          onChange={handleCategoryInputChange}
          placeholder="Enter categories, comma separated"
          className={isDirty ? 'input-dirty' : ''}
          disabled={isSaving}
        />
        {isDirty && (
          <button onClick={handleSaveCategories} className="save-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      {error && <p style={{ color: "var(--error-color)", marginTop: "0.25rem", textAlign: 'left', width: '100%' }}>{error}</p>}
    </div>
  );
};

const ItemTagsField: React.FC<ItemTagsFieldProps> = ({ itemId, initialTags, onSave }) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setTags(initialTags);
    setNewTagInput(initialTags.join(', ')); // Initialize input with current tags
    setIsDirty(false);
  }, [initialTags]);

  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setNewTagInput(inputValue);
    setIsDirty(inputValue !== initialTags.join(', '));
    if (error) { setError(null); }
  };

  const handleSaveTags = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    setError(null);
    try {
      const parsedTags = newTagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      await onSave(parsedTags);
      setTags(parsedTags); // Update local state after successful save
      setIsDirty(false);
    } catch (err: any) {
      console.error("Failed to save tags:", err);
      setError(err.message || "Failed to update tags.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDonationChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    let updatedTags: string[];

    if (isChecked) {
      updatedTags = [...new Set([...tags, "donation"])]; // Add "donation" if not present
    } else {
      updatedTags = tags.filter(tag => tag !== "donation"); // Remove "donation"
    }

    // Optimistically update local state
    setTags(updatedTags);
    setNewTagInput(updatedTags.join(', ')); // Update input field as well

    setIsSaving(true);
    setError(null);
    try {
      await onSave(updatedTags);
      setIsDirty(false); // Reset dirty state after successful save
    } catch (err: any) {
      console.error("Failed to save tags:", err);
      setError(err.message || "Failed to update tags.");
      setTags(initialTags); // Revert on error
      setNewTagInput(initialTags.join(', ')); // Revert input field
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="setting-field">
      <label htmlFor={`item-tags-input-${itemId}`}>Tags:</label>
      <div className="input-with-button">
        <input
          id={`item-tags-input-${itemId}`}
          type="text"
          value={newTagInput}
          onChange={handleTagInputChange}
          placeholder="Enter tags, comma separated"
          className={isDirty ? 'input-dirty' : ''}
          disabled={isSaving}
        />
        {isDirty && (
          <button onClick={handleSaveTags} className="save-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      <div className="input-with-button" style={{ marginTop: '0.5rem' }}>
        <label htmlFor={`item-tag-donation-${itemId}`} className="checkbox-label">
          <input
            type="checkbox"
            id={`item-tag-donation-${itemId}`}
            checked={tags.includes("donation")}
            onChange={handleDonationChange}
            disabled={isSaving}
          />
          Donation
        </label>
      </div>
      {error && <p style={{ color: "var(--error-color)", marginTop: "0.25rem", textAlign: 'left', width: '100%' }}>{error}</p>}
    </div>
  );
};

type ItemSetting = {
  id: string;
  name: string;
  holdMinutes: string;
  restaurant_id: string;
  unit: string;
  imageUrl: string;
  tags: string[];
  categories: string[];
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
      case 'username': { ({ error } = await supabase.auth.updateUser({data: { username: newValue }})); break; }
      case 'email': { ({ error } = await supabase.auth.updateUser({ email: newValue.toString() })); break; }
      case 'password': { ({ error } = await supabase.auth.updateUser({password: newValue.toString() })); break; }
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
      case 'endDate': {({ error } = await supabase.from('subscriptions').update({endDate: newValue})); break; }
      case 'plan': {({ error } = await supabase.from('subscriptions').update({plan: newValue})); break; }
      case 'autorenew': {await fetch(`${SUPABASE_URL}/functions/v1/subscription-data`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ email: session?.user.email, autoRenew: false })
        });
        break;
      }
      default:
        throw new Error(`Unknown subscription setting: ${fieldName}`);
    }
    if (error) {
      console.error(`Error saving ${fieldName}:`, error.message);
      throw new Error(`Failed to update ${fieldName}. `+error.message);
    }
    console.log(`${fieldName} updated successfully.`);
  };

  const handleSaveItemSetting = (fieldName: string, itemId: string) => async (newValue: string | number | string[]) => {
    console.log(`Attempting to save Item Setting - ${fieldName}: ${newValue}`);
    if (!session?.user) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    let error;
    switch (fieldName) {
      case 'name': {({ error } = await supabase.from('items').update({name: newValue}).eq('id', itemId)); break; }
      case 'restaurant_id': {({ error } = await supabase.from('items').update({restaurant_id: newValue}).eq('id', itemId)); break; }
      case 'unit': {({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {unit: newValue}})); break; }
      case 'holdingtime': {
        const newValueString = newValue.toString(); // Ensure we're working with a string
        const parsedHoldingTime = parseInt(newValueString);
        if (newValueString !== '' && (isNaN(parsedHoldingTime) || parsedHoldingTime < 0)) {
          throw new Error("Holding Time must be 0 or a positive number.");
        }
        let error; ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {"holdMinutes": newValueString === '' ? null : parsedHoldingTime}}));
        break;
      }
      case 'imageUrl': { let error; ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {imageUrl: newValue}})); break; }
      case 'tags': {
        let tagsToSave: string[];
        if (Array.isArray(newValue)) {
          tagsToSave = newValue;
        } else if (typeof newValue === 'string') {
          tagsToSave = newValue.split(',').map(tag => tag.trim());
        } else {
          throw new Error("Invalid type for tags. Expected string or string[].");
        }
        let error; ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {tags: tagsToSave}}));
        break;
      }
      case 'categories': {
        let categoriesToSave: string[];
        if (Array.isArray(newValue)) {
          categoriesToSave = newValue;
        } else if (typeof newValue === 'string') {
          categoriesToSave = newValue.split(',').map(category => category.trim());
        } else {
          throw new Error("Invalid type for categories. Expected string or string[].");
        }
        let error; ({ error } = await supabase.rpc('update_item_metadata', {item_id: itemId, new_metadata: {categories: categoriesToSave}}));
        break;
      }
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
    autorenew: false,
    plan: "all",
  });
  const [restaurantSettings, setRestaurantsSettings] = useState<any[]>([]);
  const [itemSettings, setItemsSettings] = useState<ItemSetting[]>([]);

  const getFranchiseItems = useCallback(async (restaurantId: string) => {
    console.log(`getFranchiseItems called for restaurant: ${restaurantId}`);
    try {
      const { data, error } = await supabase.rpc('get_user_restaurant_items');
      console.log("RPC get_user_restaurant_items response:", { data, error });
      if (error) {
        console.error("Error fetching user restaurant items RPC:", error);
        return []; // Return empty array on error
      }

      if (data && data.length > 0) {
        const itemsToInsert: any[] = [];
        console.log(data)
        for (const {items} of data.filter((entry: any) => entry.restaurant_id === restaurantId)) {
          for (const item of items) {
            // Construct the item object for insertion, similar to AddItemDialog
            const newItem = {
              name: item.name || '', // Ensure name is not null
              restaurant_id: restaurantId, // Use the restaurantId passed to the function
              metadata: {
                unit: item.metadata?.unit || 'count', // Default to 'count' if not provided
                holdMinutes: item.metadata?.holdMinutes !== undefined ? item.metadata.holdMinutes : null,
                imageUrl: item.metadata?.imageUrl || '',
                tags: Array.isArray(item.metadata?.tags) ? item.metadata.tags : [],
                categories: Array.isArray(item.metadata?.categories) ? item.metadata.categories : [],
              },
            };
            itemsToInsert.push(newItem);
          }
        }
        console.log(itemsToInsert);

        if (itemsToInsert.length > 0) {
          console.log(`Inserting ${itemsToInsert.length} franchise items for restaurant ${restaurantId}.`);
          const { data: insertedData, error: insertError } = await supabase.from('items').insert(itemsToInsert).select('*'); // Select the inserted data to return it

          if (insertError) {
            console.error("Error inserting franchise items:", insertError);
            // Depending on desired behavior, might re-throw or return empty
            return [];
          } else if (insertedData) {
            console.log("Successfully inserted franchise items:", insertedData);
            // Format the inserted data to match the expected itemSettings structure
            return insertedData.map((itemData: any) => ({
              id: itemData.id,
              name: itemData.name,
              holdMinutes: itemData.metadata.holdMinutes !== null ? String(itemData.metadata.holdMinutes) : "",
              restaurant_id: itemData.restaurant_id,
              unit: itemData.metadata.unit,
              imageUrl: itemData.metadata.imageUrl,
              tags: Array.isArray(itemData.metadata?.tags) ? itemData.metadata.tags : [],
              categories: Array.isArray(itemData.metadata?.categories) ? itemData.metadata.categories : []
            }));
          }
        }
      }
      return []; // Return empty array if no matching restaurant or items to insert
    } catch (err) {
      console.error("An unexpected error occurred in getFranchiseItems:", err);
      return []; // Return empty array on unexpected error
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    if (session?.user) {
      //Fetch user settings (e.g., from a 'profiles' table or user_metadata)
      setUserSettings({ email: session.user.email || '', username: session.user.user_metadata.username || ''});

      //Fetch subscription settings
      const { data: subscriptionData } = await supabase.from('subscriptions').select('*').single();
      // Check if user is subscriber
      if (subscriptionData) {
        // Get subscription data
        const stripeSubscriptionData = await (await fetch(`${SUPABASE_URL}/functions/v1/subscription-data?email=${session?.user.email||''}`)).json();
        setSubscriptionSettings({ id: subscriptionData.id, endDate: stripeSubscriptionData.current_period_end, autorenew: stripeSubscriptionData.auto_renew, plan: stripeSubscriptionData.name });

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
        const initialItems: ItemSetting[] = itemsData ? itemsData.map((itemData) => ({
          id: itemData.id,
          name: itemData.name,
          holdMinutes: itemData.metadata.holdMinutes !== null ? String(itemData.metadata.holdMinutes) : "",
          restaurant_id: itemData.restaurant_id,
          unit: itemData.metadata.unit,
          imageUrl: itemData.metadata.imageUrl,
          tags: Array.isArray(itemData.metadata?.tags) ? itemData.metadata.tags : [],
          categories: Array.isArray(itemData.metadata?.categories) ? itemData.metadata.categories : []
        })) : [];
        
        let currentAccumulatedItems = [...initialItems]; // Use a mutable local array

        // After fetching both restaurants and initial items, check for restaurants with 0 items
        if (restaurantsData) {
          const processedRestaurantIds = new Set<string>(); // Track processed restaurant IDs
          for (const restaurantData of restaurantsData) {
            if (processedRestaurantIds.has(restaurantData.id)) {
              console.log(`Skipping duplicate restaurant ID: ${restaurantData.id}`);
              continue; // Skip if this restaurant ID has already been processed
            }

            // Filter against the current local accumulated items
            const itemsForRestaurant = currentAccumulatedItems.filter(item => item.restaurant_id === restaurantData.id);
            if (itemsForRestaurant.length === 0) {
              console.log(`Restaurant ${restaurantData.id} has 0 items. Attempting to fetch franchise items.`);
              const franchiseItems = await getFranchiseItems(restaurantData.id);
              if (franchiseItems.length > 0) {
                // Update the local accumulated items immediately
                currentAccumulatedItems = [...currentAccumulatedItems, ...franchiseItems];
              }
            }
            processedRestaurantIds.add(restaurantData.id); // Mark this restaurant ID as processed
          }
        }
        setItemsSettings(currentAccumulatedItems); // Update state once after all processing

      }
    }
  }, [session, getFranchiseItems]);

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

            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor={`autorenew`} className="checkbox-label">
                <input
                  type="checkbox"
                  id={`autorenew`}
                  checked={subscriptionSettings.autorenew}
                  onChange={()=>handleSaveSubscriptionSetting('autorenew')}
                />
                Auto Renew
              </label>
            </div>
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
                    <ItemCategoriesField
                      fieldId={`item-categories-${itemData.id}`}
                      label="Categories"
                      initialCategories={itemData.categories}
                      onSave={(newCategories) => handleSaveItemSetting('categories', itemData.id)(newCategories)}
                    />
                    <ItemTagsField
                      itemId={itemData.id}
                      initialTags={itemData.tags}
                      onSave={(newTags) => handleSaveItemSetting('tags', itemData.id)(newTags as any)} // Cast to any for now, will fix handleSaveItemSetting next
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