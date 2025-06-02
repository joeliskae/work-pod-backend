import { Router } from "express";

import book from "./v1/book";
import busy from "./v1/busy";
import events from "./v1/events";
import calendars from "./v1/calendars";
import userEvents from "./v1/userEvents";
import cancel from "./v1/cancel";
import booking from "./v1/booking";
import analytics from "./v1/analytics"

// Devi endpoint, poista myöhemmin
// import cache from "./v1/debug";

const router = Router();

router.use(book);
router.use(busy);
router.use(events);
router.use(calendars);
router.use(userEvents);
router.use(cancel);
router.use(booking);
router.use(analytics);

//Poista poista
// router.use(cache);

export default router;
