# JobBoard with Supabase Backend
Vanilla webpage that uses Supabase as a backend and serves as a Job Board.
Implements:
- User Profile Management.
- Job Listing creation by logged in Users.
- Job Listings public search.

## Deploy:
* Run `npx http-server .` to serve the `index.html` page.

## Conventions
- Default/root page is `index.html`.
- All unique Pages are stored as their individual PAGE.html where PAGE corresponds to the URL slug of that Page.
- All reusable page Components are stored within Components folder.
- All globally used styles and scripts are stored within the `styles.css` and `scripts.js` files respectively.