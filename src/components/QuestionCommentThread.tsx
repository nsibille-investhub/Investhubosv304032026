import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  X,
  Check,
  User,
  AtSign,
  MoreVertical,
  Trash2,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  mentions: string[];
  timestamp: Date;
  resolved: boolean;
}

interface QuestionCommentThreadProps {
  questionId: string;
  questionText: string;
  isOpen: boolean;
  onClose: () => void;
  comments?: Comment[];
  onAddComment?: (comment: Comment) => void;
  onResolveComment?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

const availableMentions = [
  { id: '1', name: 'Thomas Martin', role: 'Compliance Analyst', type: 'colleague' },
  { id: '2', name: 'Sophie Dubois', role: 'Manager', type: 'colleague' },
  { id: '3', name: 'Pierre Durand', role: 'Investisseur', type: 'investor' },
  { id: '4', name: 'Marie Laurent', role: 'Contact investisseur', type: 'contact' },
];

export function QuestionCommentThread({
  questionId,
  questionText,
  isOpen,
  onClose,
  comments: initialComments = [],
  onAddComment,
  onResolveComment,
  onDeleteComment
}: QuestionCommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    // Extract mentions from text
    const mentionRegex = /@(\w+(?:\s+\w+)?)/g;
    const mentions = [...newComment.matchAll(mentionRegex)].map(m => m[1]);

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Vous',
      authorRole: 'Compliance Analyst',
      text: newComment,
      mentions,
      timestamp: new Date(),
      resolved: false
    };

    if (onAddComment) {
      onAddComment(comment);
    }
    setNewComment('');
    toast.success('Commentaire ajouté', {
      description: mentions.length > 0 
        ? `${mentions.length} personne(s) notifiée(s)` 
        : undefined
    });
  };

  const handleResolve = (commentId: string) => {
    if (onResolveComment) {
      onResolveComment(commentId);
    }
    toast.success('Commentaire résolu');
  };

  const handleDelete = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
    toast.success('Commentaire supprimé');
  };

  const handleMentionSelect = (mention: typeof availableMentions[0]) => {
    const beforeCursor = newComment.slice(0, cursorPosition);
    const afterCursor = newComment.slice(cursorPosition);
    const beforeAt = beforeCursor.lastIndexOf('@');
    
    const newText = beforeCursor.slice(0, beforeAt) + '@' + mention.name + ' ' + afterCursor;
    setNewComment(newText);
    setShowMentions(false);
    setMentionSearch('');
  };

  const handleTextChange = (text: string) => {
    setNewComment(text);
    
    // Check if user is typing a mention
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = text.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(afterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const filteredMentions = availableMentions.filter(m =>
    m.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const unresolvedCount = initialComments.filter(c => !c.resolved).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t border-gray-200 bg-gray-50"
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm text-gray-900">Discussion</span>
                {unresolvedCount > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                    {unresolvedCount} non résolu{unresolvedCount > 1 ? 's' : ''}
                  </Badge>
                )}
                {initialComments.length > 0 && unresolvedCount === 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Tout résolu
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-1">{questionText}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments list */}
          {initialComments.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {initialComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border p-3 ${
                    comment.resolved 
                      ? 'border-emerald-200 bg-emerald-50/30' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div>
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {comment.authorRole}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {comment.resolved && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Résolu
                            </Badge>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!comment.resolved && (
                                <DropdownMenuItem onClick={() => handleResolve(comment.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                                  Marquer comme résolu
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(comment.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>
                      
                      {comment.mentions.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <AtSign className="w-3 h-3 text-blue-600" />
                          {comment.mentions.map((mention, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {mention}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {comment.timestamp.toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {initialComments.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              Aucun commentaire pour le moment
            </div>
          )}

          <Separator />

          {/* New comment input */}
          <div className="space-y-2">
            <div className="relative">
              <Textarea
                value={newComment}
                onChange={(e) => {
                  handleTextChange(e.target.value);
                  setCursorPosition(e.target.selectionStart || 0);
                }}
                placeholder="Ajouter un commentaire... (utilisez @ pour mentionner quelqu'un)"
                className="min-h-[80px] text-sm resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAddComment();
                  }
                }}
              />
              
              {/* Mentions popover */}
              {showMentions && filteredMentions.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                  <div className="text-xs text-gray-500 mb-2 px-2">Mentionner:</div>
                  {filteredMentions.map((mention) => (
                    <button
                      key={mention.id}
                      onClick={() => handleMentionSelect(mention)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 text-left"
                    >
                      <Avatar className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{mention.name}</div>
                        <div className="text-xs text-gray-500">{mention.role}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {mention.type === 'colleague' ? 'Équipe' : mention.type === 'investor' ? 'Investisseur' : 'Contact'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd>
                {' + '}
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd>
                {' pour envoyer'}
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <AtSign className="w-4 h-4" />
                      Mentionner
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2">
                    <div className="space-y-1">
                      {availableMentions.map((mention) => (
                        <button
                          key={mention.id}
                          onClick={() => handleMentionSelect(mention)}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 text-left"
                        >
                          <Avatar className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{mention.name}</div>
                            <div className="text-xs text-gray-500">{mention.role}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {mention.type === 'colleague' ? 'Équipe' : mention.type === 'investor' ? 'Investisseur' : 'Contact'}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="gap-2"
                  style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
