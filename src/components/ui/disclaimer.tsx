import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The compliance boundary, stated plainly. Thesis surfaces the user's own data
 * and their own rules -- it never issues buy/sell/hold recommendations. Every
 * analytical page carries this.
 */
const DEFAULT_TEXT =
  'Thesis is an analysis tool, not an investment adviser. Nothing here is a recommendation to buy, sell, or hold any security. All figures are drawn from public filings and your own inputs.';

export interface DisclaimerProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Override the standard wording for page-specific framing. */
  children?: React.ReactNode;
}

/** Inline form -- sits at the end of an analytical section. */
function Disclaimer({ className, children, ...props }: DisclaimerProps) {
  return (
    <p
      className={cn('text-caption normal-case tracking-normal text-ink-tertiary', className)}
      {...props}
    >
      {children ?? DEFAULT_TEXT}
    </p>
  );
}

/** Page-level form -- a ruled band closing the document. */
function DisclaimerFooter({ className, children, ...props }: DisclaimerProps) {
  return (
    <footer className={cn('mt-12 border-t border-border pt-6', className)}>
      <Disclaimer {...props}>{children}</Disclaimer>
    </footer>
  );
}

export { Disclaimer, DisclaimerFooter, DEFAULT_TEXT as DISCLAIMER_TEXT };
