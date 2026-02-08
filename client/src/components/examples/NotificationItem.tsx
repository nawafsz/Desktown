import { NotificationItem } from "../NotificationItem";

export default function NotificationItemExample() {
  return (
    <div className="w-80 space-y-1 p-2 border rounded-md bg-card">
      <NotificationItem
        id={1}
        type="task"
        title="New task assigned"
        message="You have been assigned to 'Review Q4 reports'"
        time="5 min ago"
        isRead={false}
        onClick={() => console.log("Notification clicked")}
      />
      <NotificationItem
        id={2}
        type="meeting_invite"
        title="Meeting reminder"
        message="Sprint Planning starts in 30 minutes"
        time="25 min ago"
        isRead={false}
        onClick={() => console.log("Notification clicked")}
      />
      <NotificationItem
        id={3}
        type="chat"
        title="Comment on your post"
        message="James Wilson commented on your update"
        time="1 hour ago"
        isRead={true}
        onClick={() => console.log("Notification clicked")}
      />
    </div>
  );
}
