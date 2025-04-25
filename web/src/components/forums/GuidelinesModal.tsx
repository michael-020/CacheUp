import { FC, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, AlertTriangle, Info } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidelinesModal: FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Rules organized by priority and categorized
  const rules = [
    // Critical Safety Rules
    {
      category: "Critical Safety",
      icon: <Shield className="w-5 h-5 text-red-500" />,
      rules: [
        {
          title: "No NSFW or Harmful Content",
          desc: "Strictly no explicit, violent, or self-harm-related posts. Keep it college-appropriate.",
          priority: "high"
        },
        {
          title: "No Doxing or Personal Information",
          desc: "Never share anyone's private details, including real names, numbers, addresses, or any personally identifiable information without explicit consent.",
          priority: "high"
        },
        {
          title: "No Malicious Links",
          desc: "No viruses, phishing scams, malware, or any potentially harmful links. All shared resources must be safe and legitimate.",
          priority: "high"
        },
        {
          title: "No Hate Speech or Discrimination",
          desc: "Zero tolerance for content that attacks individuals or groups based on race, ethnicity, gender, religion, sexual orientation, or other protected characteristics.",
          priority: "high"
        }
      ]
    },
    // Community Integrity Rules
    {
      category: "Community Integrity",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      rules: [
        {
          title: "No Selling or Crowdfunding",
          desc: "Campus Connect isn't a marketplace. No selling, fundraising, or asking for money. Break this = permaban.",
          priority: "medium"
        },
        {
          title: "Academic Integrity",
          desc: "Do not request or share content that violates academic integrity policies. Collaboration is encouraged, but cheating is prohibited.",
          priority: "medium"
        },
        {
          title: "No Impersonation",
          desc: "Do not pretend to be faculty, staff, or other students. Authenticity and honesty are fundamental.",
          priority: "medium"
        },
        {
          title: "No Trading or Exchanges",
          desc: "This isn't a swap meet. Do not offer trades or barter content, including notes, answers, or services.",
          priority: "medium"
        },
        {
          title: "No External Promotion",
          desc: "No Discord/Telegram links or promotion of external platforms, servers, or groups without prior approval.",
          priority: "medium"
        }
      ]
    },
    // Quality Standards
    {
      category: "Quality Standards",
      icon: <Info className="w-5 h-5 text-blue-500" />,
      rules: [
        {
          title: "Search Before Posting",
          desc: "Check if your question or topic already exists. Use descriptive titles and relevant tags to help others find your content.",
          priority: "standard"
        },
        {
          title: "Stay On Topic",
          desc: "Keep discussions relevant to the thread topic. Create a new thread if you want to discuss something different.",
          priority: "standard"
        },
        {
          title: "No Spamming",
          desc: "No excessive posting, duplicative content, or off-topic self-promotion. Quality over quantity.",
          priority: "standard"
        },
        {
          title: "Use Approved File Hosts",
          desc: "Only upload files via trusted platforms like Google Drive, Dropbox, Mega, Mediafire, etc.",
          priority: "standard"
        },
        {
          title: "No Reaction Farming",
          desc: "Don't beg for likes or intentionally post controversial content just to generate reactions.",
          priority: "standard"
        },
        {
          title: "Constructive Communication",
          desc: "Be respectful in disagreements. Focus on ideas, not personal attacks. Help maintain a positive learning environment.",
          priority: "standard"
        },
        {
          title: "Respect Privacy",
          desc: "Do not share screenshots of private conversations or email exchanges without permission from all parties involved.",
          priority: "standard"
        }
      ]
    },
    // Administrative Rules
    {
      category: "Administrative",
      icon: <Shield className="w-5 h-5 text-gray-500" />,
      rules: [
        {
          title: "Staff Has Final Say",
          desc: "Moderators and Admins can edit/delete posts anytime. Respect decisions — disputes should be handled privately.",
          priority: "standard"
        },
        {
          title: "Report Responsibly",
          desc: "Report issues with specific reasons. Don't abuse the report feature or create false reports.",
          priority: "standard"
        },
        {
          title: "Access is a Privilege",
          desc: "Being here is earned, not guaranteed. Repeated or severe rule violations will result in removal.",
          priority: "standard"
        }
      ]
    }
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm dark:bg-neutral-900/80 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10">
          <h2 className="text-2xl font-bold dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            Campus Connect Community Guidelines
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Introduction */}
        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
          <p className="text-center text-md mb-0 text-blue-800 dark:text-blue-300 font-medium">
            These guidelines help maintain a collaborative, respectful, and productive community. 
            Violations may result in warnings, temporary restrictions, or permanent removal.
          </p>
        </div>

        {/* Rules Content */}
        <div className="p-6">
          <div className="space-y-8">
            {rules.map((category, i) => (
              <div key={i} className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="mr-2">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{category.category}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.rules.map((rule, j) => (
                    <div
                      key={j}
                      className={`
                        bg-white dark:bg-neutral-700 border rounded-xl p-5 transition-all
                        ${rule.priority === 'high' ? 'border-red-200 dark:border-red-800 shadow-md hover:shadow-lg' : ''}
                        ${rule.priority === 'medium' ? 'border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md' : ''}
                        ${rule.priority === 'standard' ? 'border-gray-200 dark:border-neutral-600 hover:shadow-sm' : ''}
                      `}
                    >
                      <h4 className={`
                        text-lg font-semibold mb-2
                        ${rule.priority === 'high' ? 'text-red-700 dark:text-red-400' : ''}
                        ${rule.priority === 'medium' ? 'text-amber-700 dark:text-amber-400' : ''}
                        ${rule.priority === 'standard' ? 'text-blue-700 dark:text-blue-400' : ''}
                      `}>
                        {rule.title}
                      </h4>
                      <p className="text-base text-gray-600 dark:text-neutral-300">{rule.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t dark:border-neutral-700 p-5 flex justify-between items-center bg-gray-50 dark:bg-neutral-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: April 2025
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            I understand
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GuidelinesModal;