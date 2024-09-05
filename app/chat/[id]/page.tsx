import GroupChat from "@/components/GroupChat";

export default function ChatRoomPage({ params }: { params: any }) {
  return <GroupChat id={params.id} />;
}
