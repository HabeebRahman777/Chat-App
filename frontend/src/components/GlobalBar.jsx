import React, { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { useChatStore } from '../store/useChatStore'
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from '../store/useAuthStore';

const GlobalBar = () => {
  const { users, getUsers,fetchSentRequests,sentRequests,fetchFriends,friends } = useChatStore()
  const{ authUser }=useAuthStore()
  const [requestSent, setRequestSent] = useState(false);
  
  useEffect(() => {
    getUsers()
    fetchFriends()
  }, [getUsers])

  useEffect(() => {
    fetchSentRequests()
    fetchFriends()
  }, [requestSent])

  const handleMakeFriend = async (userId) => {
    
    try {
        const response = await axiosInstance.post("/message/friend-request",{userId:authUser._id,targetUserId:userId})
        if (response.status === 200) {
            setRequestSent(prev => !prev)
            console.log(response.data.message)
          }
          
    } catch (error) {
        console.error("Error sending friend request:", error.response?.data?.message || error.message);
    }

  }

  

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Global Users</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => {
          const isFriend = friends?.includes(user._id);
          const isRequested = sentRequests?.includes(user._id);

          return (
            <div key={user._id} className="flex items-center gap-3 p-2">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
              </div>

              {/* Show "Friend" for friends, otherwise show request button */}
              {isFriend ? (
                <span className="hidden lg:block text-green-500 font-medium">Friend</span>
              ) : (
                <button
                  onClick={() => handleMakeFriend(user._id)}
                  disabled={isRequested}
                  className={`hidden lg:block px-3 py-1 text-sm rounded-lg ${
                    isRequested ? "bg-gray-400 text-black cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isRequested ? "Requested" : "Make Friend"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  )
}

export default GlobalBar
