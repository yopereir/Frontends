import React, { useState } from 'react';

const TagFilters = () => {
  const [isDonationChecked, setIsDonationChecked] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid var(--menu-border)', borderRadius: '8px', backgroundColor: 'var(--menu-bg)' }}>
      <h4 style={{ color: 'var(--menu-text)', margin: 0 }}>Filters</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          id="donationFilter"
          checked={isDonationChecked}
          onChange={() => setIsDonationChecked(!isDonationChecked)}
          style={{
            width: '18px',
            height: '18px',
            accentColor: 'var(--button-color)',
          }}
        />
        <label htmlFor="donationFilter" style={{ color: 'var(--menu-text)', fontSize: '0.9rem' }}>Donation</label>
      </div>
    </div>
  );
};

export default TagFilters;
