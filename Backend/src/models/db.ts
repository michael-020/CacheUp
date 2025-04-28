import mongoose, { Document, Model, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; 
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  department: string;
  graduationYear: string;
  bio?: string;
  posts: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  _doc?: Omit<IUser, '_doc'>;
  createdAt: Date;
  updatedAt: Date;
  visibility?: Boolean
}

// Admin Interface
export interface IAdmin extends Document {
  name: string;
  adminId: string;
  password: string;
  role?: string;
  _doc?: Omit<IAdmin, '_doc'>;
  createdAt: Date;
  updatedAt: Date;
  visibility?: Boolean
}

export interface Comment {
    _id?: mongoose.Types.ObjectId; 
    _doc?: Omit<IUser, '_doc'>;
    content: string;
    user: mongoose.Types.ObjectId;
    date: Date;
    visibility?: Boolean
  }

// Post Interface
export interface IPost extends Document {
  postedBy: mongoose.Types.ObjectId;
  username: string;
  userImagePath?: string;
  postsImagePath?: string;
  text: string;
  likes: mongoose.Types.ObjectId[];
  reportedBy: mongoose.Types.ObjectId[];
  savedBy: mongoose.Types.ObjectId[];
  comments: Comment[];
  _doc?: Omit<IPost, '_doc'>;
  createdAt: Date;
  updatedAt: Date;
  visibility?: Boolean
}

// OTP Interface
interface IOTP extends Document {
  email: string;
  otp: string;
  _doc?: Omit<IOTP, '_doc'>;
  createdAt: Date;
  expiresAt: Date;
}

interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  chatRoom: mongoose.Types.ObjectId; 
  sender: mongoose.Types.ObjectId; 
  receiver: mongoose.Types.ObjectId;
  content?: string; 
  image?: string;
  isRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatRoom extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[]; 
  messages?: mongoose.Types.ObjectId[]; 
  createdAt: Date;
  updatedAt: Date;
}

// Forum Interface
export interface IForum extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  weaviateId: string;
  visibility?: Boolean
}


// Forums Threads Interface
export interface IThreadForum extends Document {
  title: string;
  description?: string;
  forum: mongoose.Types.ObjectId;
  createdAt: Date;
  createdBy: String;
  watchedBy?: mongoose.Types.ObjectId[];
  reportedBy?: mongoose.Types.ObjectId[];
  weaviateId?: string
  visibility?: Boolean
}

// Forums Post Interface
export interface IPostForum extends Document {
  content: string;
  thread: mongoose.Types.ObjectId;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  likedBy?: mongoose.Types.ObjectId[];
  disLikedBy?: mongoose.Types.ObjectId[];
  reportedBy?: mongoose.Types.ObjectId[];
  weaviateId: string;
  commentsCount: number;
  visibility?: Boolean
  page?: number
}

// Forums Comment Interface
export interface ICommentForum extends Document {
  content: string;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  likedBy?: mongoose.Types.ObjectId[];
  disLikedBy?: mongoose.Types.ObjectId[];
  reportedBy?: mongoose.Types.ObjectId[];
  weaviateId: string;
  visibility?: Boolean
}

// Notification Interface
interface INotification extends Document {
  userIds: Schema.Types.ObjectId[]; 
  message: string; 
  threadId: Schema.Types.ObjectId;
  seenBy: Schema.Types.ObjectId[];
  createdAt: Date; 
  postId?: Schema.Types.ObjectId
  commentId?: Schema.Types.ObjectId
  createdBy: Schema.Types.ObjectId
}

// Request forum Interface
interface IRequestForum extends Document {
  title: string;
  description: string;
  requestedBy: Schema.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// SCHEMAS FROM HERE

// User Schema
const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    lowercase: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  profilePicture: { 
    type: String, 
    default: '' 
  },
  department: { 
    type: String, 
    required: [true, 'Department is required'] 
  },
  graduationYear: { 
    type: String, 
    required: [true, 'Graduation year is required'],
    min: [2000, 'Graduation year must be after 2000'],
    max: [2100, 'Graduation year must be before 2100']
  },
  bio: { 
    type: String, 
    maxlength: [200, 'Bio cannot exceed 200 characters'] 
  },
  posts: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'posts' 
  }],
  friends: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'users' 
  }],
  friendRequests: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'users' 
  }],
  visibility: {type: Boolean, default: true} 
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Admin Schema
const adminSchema = new Schema<IAdmin>({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  adminId: { 
    type: String, 
    required: [true, 'Admin ID is required'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: { 
    type: String, 
    default: 'admin' 
  },
  visibility: {type: Boolean, default: true}
}, { 
  timestamps: true 
});

// Post Schema
const postSchema = new Schema<IPost>({
  postedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'users', 
    required: [true, 'Post must have an author'] 
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'] 
  },
  userImagePath: String,
  postsImagePath: String,
  text: { 
    type: String, 
    maxlength: [200, 'Post text cannot exceed 200 characters'] 
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'users' 
  }],
  reportedBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'users' 
  }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    content: { 
      type: String, 
      required: [true, 'Comment content is required'] 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'users', 
      required: [true, 'Comment must have a user'] 
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    visibility: {type: Boolean, default: true}
  }],
  visibility: {type: Boolean, default: true} 
}, { 
  timestamps: true 
});

// OTP Schema
const otpSchema = new Schema<IOTP>({
  email: { 
    type: String, 
    required: [true, 'Email is required'] 
  },
  otp: { 
    type: String, 
    required: [true, 'OTP is required'] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 600 
  },
  expiresAt: {
    type: Date,
    required: true,
  }
});

const chatSchema = new Schema<IChat>({
  chatRoom: { 
      type: Schema.Types.ObjectId, 
      ref: 'chatrooms', 
      required: true 
  },
  sender: { 
      type: Schema.Types.ObjectId, 
      ref: 'users', 
      required: true 
  },
  receiver: {
      type: Schema.Types.ObjectId,
      ref: "users"
  },
  content: { 
      type: String
  },
  image: {
      type: String,
      default: ""
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true 
});

const chatRoomSchema = new Schema<IChatRoom>({
  participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users', 
      required: true 
  }],
  messages: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'messages' 
  }],
}, {
  timestamps: true
})

// Forum Schema
const forumSchema = new Schema<IForum>({
  title: {
    type: String,
    required: [true, "name is required"],
    unique: true
  },
  description: {
    type: String,
    required: [true, "Please give some description about the forum"]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  weaviateId: {
    type: String,
    required: true
  },
  visibility: {type: Boolean, default: true} 
})

// Thread Forum Schema
const threadForumSchema = new Schema<IThreadForum>({
  title: {
    type: String,
    maxlength: [50, "Please give a shorter name"],
    required: [true, "Thread should have a title"],
    unique: true
  },
  description: {
    type: String
  },
  forum: {
    type: Schema.Types.ObjectId,
    ref: 'forums'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  watchedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  weaviateId: {
    type: String
  },
  visibility: {type: Boolean, default: true} 
})

// Post Forum Schema
const postForumSchema = new Schema<IPostForum>({
  content: {
    type: String,
    required: [true, "Post should not be empty"]
  },
  thread: {
    type: Schema.Types.ObjectId,
    ref: 'threads'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }
,
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  disLikedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  weaviateId: {
    type: String,
    required: true
  },
  visibility: {type: Boolean, default: true} 
,
  page: {type: Number},
  commentsCount: Number
})

// indexing
postForumSchema.index(
  { thread: 1, createdAt: 1 },
  { partialFilterExpression: {visibility: true} }
);
// Comment Forum Schema
const commentForumSchema = new Schema<ICommentForum>({
  content: {
    type: String,
    required:[true, "Comment cannot be empty"]
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'forumPosts'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  disLikedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  weaviateId: {
    type: String,
    required: true
  },
  visibility: {type: Boolean, default: true} 
})
// indexing
commentForumSchema.index(
  { post: 1, createdAt: 1},
  {partialFilterExpression: {visibility: true}}
)

// Watch Thread Notification Forum Schema
const watchNotificationSchema = new Schema<INotification>({
  userIds: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  message: {
    type: String
  },
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'threads'
  },
  seenBy: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "forumposts"
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "forumcomments"
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  }
})

// Request Forum Schema
const requestForumSchema = new Schema<IRequestForum>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const userLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'SIGNUP', 'PAGE_VIEW']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionDuration: {
    type: Number,
    default: 0 // Duration in minutes
  },
  page: {
    type: String,
    // Fix: Change the validation to use a validate function
    validate: {
      validator: function(this: any) {
        return this.action !== 'PAGE_VIEW' || (this.action === 'PAGE_VIEW' && this.page);
      },
      message: 'Page is required for PAGE_VIEW actions'
    }
  },
  timeSpent: {
    type: Number,
    default: 0 // Time spent in minutes
  },
  device: String,
  ipAddress: String
});

export const UserLog = mongoose.model('UserLog', userLogSchema);
export const userModel = mongoose.model<IUser, Model<IUser>>('users', userSchema);
export const postModel = mongoose.model<IPost, Model<IPost>>('posts', postSchema);
export const adminModel = mongoose.model<IAdmin, Model<IAdmin>>('Admin', adminSchema);
export const otpModel = mongoose.model<IOTP, Model<IOTP>>('OTP', otpSchema);
export const chatRoomModel = mongoose.model<IChatRoom, Model<IChatRoom>>('chatrooms', chatRoomSchema);
export const chatModel = mongoose.model<IChat, Model<IChat>>('messages', chatSchema);
export const forumModel = mongoose.model<IForum, Model<IForum>>('forums', forumSchema);
export const threadForumModel = mongoose.model<IThreadForum, Model<IThreadForum>>('threads', threadForumSchema);
export const postForumModel = mongoose.model<IPostForum, Model<IPostForum>>('forumPosts', postForumSchema);
export const commentForumModel = mongoose.model<ICommentForum, Model<ICommentForum>>('forumComments', commentForumSchema);
export const watchNotificationModel = mongoose.model<INotification, Model<INotification>>('watchNotification', watchNotificationSchema)
export const requestForumModel = mongoose.model<IRequestForum, Model<IRequestForum>>('requestForums', requestForumSchema)