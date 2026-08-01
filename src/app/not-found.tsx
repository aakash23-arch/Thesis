import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-content items-center px-4 py-8">
      <div className="w-full">
        <EmptyState
          icon={FileQuestion}
          title="That page does not exist"
          description="The link may be out of date, or the page may have moved."
          action={
            <Button asChild variant="secondary">
              <Link href="/">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
