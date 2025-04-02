export interface ForumData {
    id: string
    title: string
    description: string
    createdBy: string
    createdAt: string
    memberCount: number
    threadCount: number
  }
  
  export interface ThreadData {
    id: string
    forumId: string
    title: string
    content: string
    createdBy: string
    createdAt: string
    commentCount: number
  }
  
  export interface CommentData {
    id: string
    threadId: string
    content: string
    createdBy: string
    createdAt: string
  }
  
  // Mock data for forums
  export const mockForums: ForumData[] = [
    {
      id: "forum-1",
      title: "General Discussion",
      description: "Talk about anything related to our community",
      createdBy: "Admin",
      createdAt: "2023-01-15T00:00:00.000Z",
      memberCount: 1250,
      threadCount: 85,
    },
    {
      id: "forum-2",
      title: "Introductions",
      description: "New to the community? Introduce yourself here!",
      createdBy: "Admin",
      createdAt: "2023-01-20T00:00:00.000Z",
      memberCount: 980,
      threadCount: 120,
    },
    {
      id: "forum-3",
      title: "Help & Support",
      description: "Get help with any issues you're facing",
      createdBy: "Moderator",
      createdAt: "2023-02-05T00:00:00.000Z",
      memberCount: 750,
      threadCount: 65,
    },
    {
      id: "forum-4",
      title: "Feature Requests",
      description: "Suggest new features and improvements",
      createdBy: "Admin",
      createdAt: "2023-02-10T00:00:00.000Z",
      memberCount: 620,
      threadCount: 42,
    },
    {
      id: "forum-5",
      title: "Off-Topic",
      description: "Discuss anything not related to our main topics",
      createdBy: "Moderator",
      createdAt: "2023-03-01T00:00:00.000Z",
      memberCount: 890,
      threadCount: 110,
    },
    {
      id: "forum-6",
      title: "News & Announcements",
      description: "Stay updated with the latest news and announcements",
      createdBy: "Admin",
      createdAt: "2023-01-10T00:00:00.000Z",
      memberCount: 1500,
      threadCount: 30,
    },
  ]
  
  // Mock data for threads
  export const mockThreads: ThreadData[] = [
    {
      id: "thread-1",
      forumId: "forum-1",
      title: "Welcome to our new forums!",
      content: "We're excited to launch our new forums platform. Let us know what you think!",
      createdBy: "Admin",
      createdAt: "2023-04-10T00:00:00.000Z",
      commentCount: 15,
    },
    {
      id: "thread-2",
      forumId: "forum-1",
      title: "Community guidelines - Please read",
      content:
        "Here are the guidelines for participating in our community forums. Please follow these rules to ensure a positive experience for everyone.",
      createdBy: "Moderator",
      createdAt: "2023-04-12T00:00:00.000Z",
      commentCount: 8,
    },
    {
      id: "thread-3",
      forumId: "forum-2",
      title: "Hello from California!",
      content:
        "Hi everyone! I'm new here and wanted to introduce myself. I'm from California and excited to join this community!",
      createdBy: "CaliforniaDreamer",
      createdAt: "2023-04-15T00:00:00.000Z",
      commentCount: 12,
    },
    {
      id: "thread-4",
      forumId: "forum-3",
      title: "Having trouble with login",
      content: "I can't seem to log in from my mobile device. Has anyone else experienced this issue?",
      createdBy: "TechNewbie",
      createdAt: "2023-04-18T00:00:00.000Z",
      commentCount: 6,
    },
    {
      id: "thread-5",
      forumId: "forum-4",
      title: "Dark mode suggestion",
      content:
        "I think it would be great if we could have a dark mode option for the forums. It would be easier on the eyes, especially at night.",
      createdBy: "NightOwl",
      createdAt: "2023-04-20T00:00:00.000Z",
      commentCount: 25,
    },
  ]
  
  // Mock data for comments
  export const mockComments: CommentData[] = [
    {
      id: "comment-1",
      threadId: "thread-1",
      content: "This is awesome! The new design looks great.",
      createdBy: "ForumFan",
      createdAt: "2023-04-10T12:00:00.000Z",
    },
    {
      id: "comment-2",
      threadId: "thread-1",
      content: "I'm loving the new features. Much easier to navigate now.",
      createdBy: "TechEnthusiast",
      createdAt: "2023-04-10T14:30:00.000Z",
    },
    {
      id: "comment-3",
      threadId: "thread-1",
      content: "Is there a mobile app coming soon?",
      createdBy: "MobileUser",
      createdAt: "2023-04-11T09:15:00.000Z",
    },
    {
      id: "comment-4",
      threadId: "thread-3",
      content: "Welcome to the community! I'm from California too, specifically San Francisco.",
      createdBy: "BayAreaTech",
      createdAt: "2023-04-15T10:20:00.000Z",
    },
    {
      id: "comment-5",
      threadId: "thread-3",
      content: "Nice to meet you! I'm from New York but visited California last year. Beautiful state!",
      createdBy: "NYCTraveler",
      createdAt: "2023-04-15T11:45:00.000Z",
    },
    {
      id: "comment-6",
      threadId: "thread-4",
      content: "I had the same issue. Try clearing your browser cache and cookies.",
      createdBy: "TechSupport",
      createdAt: "2023-04-18T14:00:00.000Z",
    },
    {
      id: "comment-7",
      threadId: "thread-4",
      content: "Are you using the latest version of the app?",
      createdBy: "AppDeveloper",
      createdAt: "2023-04-18T15:30:00.000Z",
    },
    {
      id: "comment-8",
      threadId: "thread-5",
      content: "I second this! Dark mode would be amazing.",
      createdBy: "DarkModeEnthusiast",
      createdAt: "2023-04-20T18:00:00.000Z",
    },
    {
      id: "comment-9",
      threadId: "thread-5",
      content: "Yes please! My eyes would thank you.",
      createdBy: "LateNightBrowser",
      createdAt: "2023-04-20T22:15:00.000Z",
    },
  ]
  
  