import { createFileRoute } from '@tanstack/react-router';
/**
 * Feedback page — public form to submit feedback.
 * Available in both lite and full presets.
 */
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/hooks/use-app-context';
import { getHeadMeta } from '@/lib/seo';

export const Route = createFileRoute('/{-$locale}/_landing/feedback')({
  head: () =>
    getHeadMeta({
      title: 'Feedback',
      description: 'Share your feedback with us',
    }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const { user } = useAppContext();
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { submitFeedbackFn } = await import('@/server/feedback.functions');
      await submitFeedbackFn({
        data: {
          content,
          email: user?.email || email || undefined,
          name: user?.name || name || undefined,
          type,
          userId: user?.id || undefined,
        },
      });
      setSubmitted(true);
      setContent('');
    } catch {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-lg py-20 text-center">
        <div className="rounded-lg border p-8">
          <h2 className="mb-4 text-2xl font-bold">Thank you! 🎉</h2>
          <p className="mb-6 text-muted-foreground">
            Your feedback has been submitted successfully. We appreciate your
            input!
          </p>
          <Button onClick={() => setSubmitted(false)}>Submit Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg py-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Feedback</h1>
        <p className="mt-2 text-muted-foreground">
          We'd love to hear your thoughts. Share your feedback below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!user && (
          <>
            <div>
              <Input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Textarea
            placeholder="Tell us what you think..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !content.trim()}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </div>
  );
}
