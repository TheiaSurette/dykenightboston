# Keep volunteer interest in a dedicated Google spreadsheet

Volunteer interest is collected through a native website form and stored directly
in a private, Dyke Night Boston-owned spreadsheet. This keeps the organizer's review
workflow in Sheets without introducing a second application backlog in Payload.
The server uses a dedicated service account configured through Google Cloud CLI,
rather than sharing Thirst Trap's separately deployed Apps Script gateway or its
credentials and response data. Delivery is confirmed before showing success;
ambiguous writes require checking the response reference before resubmission.
