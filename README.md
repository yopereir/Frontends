# Frontends
Repo containing frontends for websites.

## Conventions:
* Project organization is done as follows: Framework->Website Name

* Each Project should have a README.md file with instructions on how to get the website running.

* When building Docker images or to Kubernetes, use the naming convention `Language-Framework-ServiceName` for the main Image name and Namespace name.

# TODO:
# Dashboard:
item entries
view graph of items

# Items:
    - Create a new batch
    - Update existing batch
    filter items by lunch/breakfast

# remove labels:

Boxes->Bags->Items

Item-> id, type, quantity type (pounds/number based on item type), quantity amount, initialTimer.

Bags-> id, arrayOfItems.

Boxes-> id, arrayOfBags.