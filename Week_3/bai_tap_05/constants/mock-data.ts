// Mock data for Discord-style home page

export interface Server {
  id: string;
  name: string;
  icon: string | null;
  unread: number;
  color?: string;
}

export interface Channel {
  id: string;
  name: string;
  active?: boolean;
}

export interface ChannelCategory {
  textChannels: Channel[];
  voiceChannels: Channel[];
}

export const servers: Server[] = [
  { id: '1', name: 'nơi đây chứa nỗi buồn', icon: null, unread: 1, color: '#5865F2' },
  { id: '2', name: 'TARS', icon: null, unread: 0, color: '#3BA55C' },
  { id: '3', name: 'Team Dev', icon: null, unread: 5, color: '#FAA61A' },
  { id: '4', name: 'Gaming Squad', icon: null, unread: 0, color: '#ED4245' },
  { id: '5', name: 'Study Group', icon: null, unread: 2, color: '#9B84EE' },
  { id: '6', name: 'Music Lounge', icon: null, unread: 0, color: '#EB459E' },
];

export const channels: ChannelCategory = {
  textChannels: [
    { id: '1', name: 'tao-la-nhat', active: true },
    { id: '2', name: 'may-la-nhi', active: false },
    { id: '3', name: 'general', active: false },
    { id: '4', name: 'off-topic', active: false },
    { id: '5', name: 'announcements', active: false },
  ],
  voiceChannels: [
    { id: '1', name: "phong' nguoi' chet", active: false },
    { id: '2', name: 'Music Room', active: false },
    { id: '3', name: 'Gaming', active: false },
  ],
};

export const currentServer = servers[0];
