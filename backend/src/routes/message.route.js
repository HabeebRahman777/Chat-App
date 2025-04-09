import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getMessages, getUsersForSidebar, sendMessage ,sendFriendRequest,fetchSendRequests, fetchRequests, acceptRequest, fetchFriends} from "../controllers/message.controller.js"

const router=express.Router()

router.get("/users",protectRoute,getUsersForSidebar)
router.get("/:id",protectRoute,getMessages)
router.post("/send/:id",protectRoute,sendMessage)
router.post("/friend-request",protectRoute,sendFriendRequest)

router.get("/sent-requests/:id",protectRoute,fetchSendRequests);
router.get("/requests/:id",protectRoute,fetchRequests);
router.post("/accept-request",protectRoute,acceptRequest)
router.get("/friends/:id",protectRoute,fetchFriends)




export default router