import "./ChatBubble.css";

function ChatBubble({ message, isOwn, time }) {
  return (
    <div
      className={`mb-4 flex ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] ${ 
            isOwn
            ? "items-end"
            : "items-start"
        } flex flex-col`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isOwn
              ? "rounded-br-md bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              : "rounded-bl-md border border-white/10 bg-slate-800 text-slate-200"
          }`}
        >
          {message}
        </div>

        {time && (
          <span className="mt-1 px-1 text-[11px] text-slate-500">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;