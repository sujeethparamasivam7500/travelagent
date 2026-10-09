# TripPilot — Travel Planning Agent

A small, responsive, browser-based project for a Prompt Engineering lab practical. It demonstrates:
- **Planning:** generates a day-wise itinerary from user requirements.
- **Constraint handling:** checks the estimated cost against the budget and validates dates, interests, and traveller count.
- **Comparison:** compares accommodation and activity alternatives.
- **Iterative refinement:** applies cost-saving changes and recalculates the budget.

## How to run
1. Extract `travel_planning_agent.zip`.
2. Open the extracted `travel_planning_agent` folder.
3. Double-click `index.html` to open it in a modern browser.
4. Use the default Ooty demo or enter your own details.
5. Click **Generate itinerary**.

No installation, backend, API key, or internet connection is required.

## Files
- `index.html` — page structure and input form
- `style.css` — responsive UI styling
- `script.js` — planning, cost estimates, constraints, comparison, refinement
- `README.md` — this guide

## Important note
This is a self-contained lab demonstration using illustrative cost estimates and rule-based refinement. It does not connect to live hotel, transport, or attraction prices and does not make bookings. Update the cost assumptions in `script.js` if you want to demonstrate different budget scenarios.

## Practical demonstration
Example input:
- Destination: Ooty
- Dates: any two consecutive dates
- Budget: ₹10,000
- Interests: Nature and Sightseeing
- Travellers: 2

To demonstrate constraint handling, set a lower budget (for example ₹5,000) and generate the plan. The agent will attempt to reduce accommodation, activity, transport, and optional costs, then report whether the resulting estimate fits.
