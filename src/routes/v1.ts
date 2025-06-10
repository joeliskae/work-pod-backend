import { Router } from "express";

import book from "./v1/book";
import events from "./v1/events";
import calendars from "./v1/calendars";
import userEvents from "./v1/userEvents";
import cancel from "./v1/cancel";
import booking from "./v1/booking";
import analytics from "./v1/analytics";
import createCalendar from "./v1/createCalendar";
import deleteCalendar from "./v1/deleteCalendar";
import editCalendar from "./v1/editCalendar";
// import busy from "./v1/busy";

// TODO: poista cache endpoint ennen tuotantoa!!!
import cache from "./v1/debug";

const router = Router();

router.use(cache);
router.use(book);
// router.use(busy); // Tätä endpointtia ei taideta käyttää, eikä se muuten edes toimi :)
router.use(events);
router.use(calendars);
router.use(userEvents);
router.use(cancel);
router.use(booking);
router.use(analytics);
router.use(createCalendar);
router.use(deleteCalendar);
router.use(editCalendar);

export default router;
