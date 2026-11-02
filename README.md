# Data's Army Mission 2: Secret Santa & Milestones (white-label)

Working module, no backend. Open `index.html` (or the GitHub Pages link) in a browser.

- **People:** add by hand, import CSV (`name,department,email,start,birthday,interests`) or click *Load demo data*.
- **Secret Santa rules:** budget, exchange date, no same-department matches, never-pair list (`A = B` both ways, `A > B` one way), last year's pairs to avoid. **Auto-assign** makes one full gift cycle that respects every rule, or says plainly when the rules make it impossible. Export pairs to CSV.
- **Milestones:** upcoming birthdays and work anniversaries in the next 30/60/90/365 days, with 3 gift ideas each, based on interests, years of service and budget.
- **Branding:** company name and brand color.

Data stays in the browser (localStorage). Not built yet: email sending, logins, a shared server database.

Tests: `node test.js` checks 500 random assignments against all rules plus the milestone and gift logic.
