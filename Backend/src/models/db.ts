import mongoose, { Document, Model, Schema } from 'mongoose';

// User Interface
export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  profileImagePath?: string;
  department: string;
  graduationYear: string;
  bio?: string;
  posts: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  _doc?: Omit<IUser, '_doc'>;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface Comment {
    _id?: mongoose.Types.ObjectId; 
    _doc?: Omit<IUser, '_doc'>;
    content: string;
    user: mongoose.Types.ObjectId;
    date: Date;
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
  comments: Comment[];
  _doc?: Omit<IPost, '_doc'>;
  createdAt: Date;
  updatedAt: Date;
}

// OTP Interface
interface IOTP extends Document {
  email: string;
  otp: string;
  _doc?: Omit<IOTP, '_doc'>;
  createdAt: Date;
}

// ChatRoom Interface
interface IChatRoom extends Document {
  type: 'private' | 'group'; // 'private' for one-to-one chat, 'group' for group chat
  participants: mongoose.Types.ObjectId[]; // Array of User IDs
  groupName?: string; // Only for group chats
  groupImagePath?: string; // Optional image for group
  lastMessage: mongoose.Types.ObjectId; // Reference to the last message
  createdAt: Date;
  updatedAt: Date;
}

// Message Interface
interface IMessage extends Document {
  chatRoom: mongoose.Types.ObjectId; // Reference to ChatRoom
  sender: mongoose.Types.ObjectId; // User ID of the sender
  content: string; // Message text or media link
  messageType: 'text' | 'image' | 'video' | 'file'; // Type of message
  readBy: mongoose.Types.ObjectId[]; // Array of User IDs who read the message
  createdAt: Date;
  updatedAt: Date;
}

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
  profileImagePath: { 
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
    ref: 'Post' 
  }],
  friends: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  friendRequests: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }]
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
  }
}, { 
  timestamps: true 
});

// Post Schema
const postSchema = new Schema<IPost>({
  postedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
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
    ref: 'User' 
  }],
  reportedBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [{
    content: { 
      type: String, 
      required: [true, 'Comment content is required'] 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Comment must have a user'] 
    },
    date: { 
      type: Date, 
      default: Date.now 
    }
  }]
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
  }
});

// chat schema
const chatRoomSchema = new Schema<IChatRoom>({
  type: { 
    type: String, 
    enum: ['private', 'group'], 
    required: true 
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  groupName: { 
    type: String, 
    required: function () { return this.type === 'group'; } 
  },
  groupImagePath: { 
    type: String, 
    default: '' 
  },
  lastMessage: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  }
}, { 
  timestamps: true 
});

const messageSchema = new Schema<IMessage>({
  chatRoom: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatRoom', 
    required: true 
  },
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'file'], 
    default: 'text' 
  },
  readBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { 
  timestamps: true 
});

export const userModel = mongoose.model<IUser, Model<IUser>>('User', userSchema);
export const postModel = mongoose.model<IPost, Model<IPost>>('Post', postSchema);
export const adminModel = mongoose.model<IAdmin, Model<IAdmin>>('Admin', adminSchema);
export const otpModel = mongoose.model<IOTP, Model<IOTP>>('OTP', otpSchema);
export const chatRoomModel = mongoose.model<IChatRoom, Model<IChatRoom>>('ChatRoom', chatRoomSchema);
export const messageModel = mongoose.model<IMessage, Model<IMessage>>('Message', messageSchema);