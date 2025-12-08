import React from 'react';

const Chat = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        {/* Chat messages will go here */}
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default Chat;
