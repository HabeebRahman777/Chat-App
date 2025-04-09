import React, { useEffect, useState } from 'react';
import { Bell } from "lucide-react";
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from "react-hot-toast";

const Notification = () => {
    const { authUser } = useAuthStore()
    const { users, fetchRequests, requests ,friends,fetchFriends} = useChatStore();
    const [requestUsers, setRequestUsers] = useState([]);
    const [accept, setAccept] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchFriends()
        
    }, [fetchRequests,fetchFriends,accept]);

    useEffect(() => {
        setRequestUsers(
            requests.map(request => users.find(user => user._id === request))
                   .filter(user => user !== undefined && !friends.includes(user._id))
        );
    }, [requests, users, accept,friends]); 

   const acceptRequest = async (userId)=>{
    try {
        const response =await axiosInstance.post('/message/accept-request',{loggedInUserId:authUser._id,userId:userId})
        
        if (response.status === 200) {
        setAccept(prev => !prev)
        console.log(response.data.message)
        toast.success("Friend request accepted!");
        }
        
    } catch (error) {
        console.error("Error accepting request:", error);
        toast.error("Failed to accept request.");
    }
   }

    return (
        <aside className="h-full w-20 lg:w-72 border-l border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <Bell className="size-6" />
                    <span className="font-medium hidden lg:block">Notification</span>
                </div>
            </div>


            <div className="overflow-y-auto w-full py-3">
                {requestUsers.length > 0 ? (
                    requestUsers.map((user) => (
                        <div key={user._id} className="flex items-center gap-3 p-2">
                            <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="size-12 object-cover rounded-full"
                            />
                            <div className="hidden lg:block text-left min-w-0 flex-1">
                                <div className="font-medium truncate">{user.fullName}</div>
                            </div>
                            <button
                                onClick={() => acceptRequest(user._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            > 
                              Accept 
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center">No new notifications</p>
                )}
            </div>
        </aside>
    );
};

export default Notification;
