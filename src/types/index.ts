// API RESPONSE WRAPPER (khớp với TransformInterceptor backend)
// { statusCode, message, data: { result, meta } }

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: {
    result: T;
    meta?: PaginationMeta | CursorMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CursorMeta {
  nextCursor: string | null;
  hasNextPage: boolean;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface LoginResponse {
  accessToken: string;
  user: UserAccount;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

// ============================================================
// USER TYPES
// ============================================================

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================
// FRIENDSHIP TYPES
// ============================================================

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';

export interface Friendship {
  _id: string;
  requester: UserAccount;
  recipient: UserAccount;
  status: FriendshipStatus;
  blockedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestPayload {
  friendId: string;
}

// ============================================================
// CONVERSATION TYPES
// ============================================================

export type ConversationType = 'DIRECT' | 'GROUP';
export type ConversationPrivacy = 'PUBLIC' | 'PRIVATE';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'ACCEPTED' | 'LEFT' | 'REMOVED';

export interface ConversationParticipant {
  userId: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
  avatar?: string | null;
}

export interface MyMembership {
  role: MemberRole;
  status: MemberStatus;
  lastReadAt: string | null;
  unreadCount: number;
}

export interface ConversationSummary {
  _id: string;
  type: ConversationType;
  privacy: ConversationPrivacy;
  name: string | null;
  avatar: string | null;
  lastMessage: Message | null;
  lastMessageAt: string | null;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail {
  id: string;
  name: string;
  type: ConversationType;
  memberCount: number;
  myMembership: MyMembership;
  participants: ConversationParticipant[];
}

export interface CreateDirectChatPayload {
  targetUserId: string;
}

export interface CreateGroupChatPayload {
  name: string;
  privacy: ConversationPrivacy;
  participantIds: string[];
}

export interface UpdateGroupNamePayload {
  name: string;
}

export interface UpdateGroupAvatarPayload {
  avatarUrl: string;
}

// ============================================================
// MEMBER TYPES
// ============================================================

export interface Member {
  _id: string;
  conversationId: string;
  userId: UserAccount;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  leftAt: string | null;
  lastReadMessageId: string | null;
  lastReadAt: string | null;
  clearedAt: string | null;
}

export interface AddMembersPayload {
  conversationId: string;
  memberIds: string[];
}

export interface RemoveMemberPayload {
  conversationId: string;
  memberId: string;
}

export interface LeaveGroupPayload {
  conversationId: string;
}

export interface UpdateRolePayload {
  conversationId: string;
  memberId: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface TransferOwnerPayload {
  conversationId: string;
  newOwnerId: string;
}

export interface MarkAsReadPayload {
  conversationId: string;
  messageId: string;
}

export interface ClearHistoryPayload {
  conversationId: string;
}

// ============================================================
// MESSAGE TYPES
// ============================================================

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: UserAccount | string;
  content: string;
  type: MessageType;
  attachments: string[];
  replyTo: Message | string | null;
  isRecalled: boolean;
  recalledAt: string | null;
  recalledBy: string | null;
  deletedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  type?: MessageType;
  attachments?: string[];
  replyTo?: string;
}

export interface GetMessagesPayload {
  limit?: number;
  cursor?: string;
}

// ============================================================
// SOCKET EVENT TYPES
// ============================================================

export interface SocketSendMessagePayload {
  conversationId: string;
  content?: string;
  type?: MessageType;
  attachments?: string[];
  replyTo?: string;
}

export interface SocketTypingPayload {
  conversationId: string;
  isTyping: boolean;
}

export interface SocketMarkReadPayload {
  conversationId: string;
  messageId: string;
}

export interface SocketRecallMessagePayload {
  messageId: string;
  conversationId: string;
}

export interface SocketUserTypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface SocketMessageReadEvent {
  conversationId: string;
  userId: string;
  messageId: string;
}

export interface SocketMessageRecalledEvent {
  conversationId: string;
  messageId: string;
}

export interface SocketUserOnlineEvent {
  userId: string;
}

export interface SocketCheckOnlinePayload {
  userIds: string[];
}

export interface SocketCheckOnlineResponse {
  onlineUserIds: string[];
}

// ============================================================
// UPLOAD TYPES
// ============================================================

export interface UploadedFile {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}
