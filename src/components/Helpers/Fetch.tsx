'use client'
import toast from "react-hot-toast";

const connectGithub = async () => {
    try {
      window.location.href = "/api/auth/github/login";
    } catch (error) {
      console.log('Error in connectGithub function', error);
    }
  };


  export const connect = () => {
    toast((t) => (
      <div className="flex flex-col text-white bg-gray-800 p-2 rounded-lg">
        <p className="font-semibold">Your Github is not connected</p>
        <div className="flex gap-2 mt-2 justify-center">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              connectGithub();
            }} 
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
          >
            Connect
          </button>
        </div>
      </div>
    ), { duration: 5000 }); 
  };