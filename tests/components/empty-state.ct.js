/**
 * Component Test — EmptyState
 *
 * TEMPLATE: Replace the import path with the actual component path
 * once surecontact-nextjs is cloned locally.
 *
 * Run: npm run test:components
 */

// ──────────────────────────────────────────────────────────────────────────────
// STEP 1: Replace this import with the actual component from the Next.js repo.
//   import { EmptyState } from '../../../surecontact-nextjs/src/components/EmptyState';
//
// STEP 2: Remove the stub below once you have the real component.
// ──────────────────────────────────────────────────────────────────────────────
import React from 'react';

/** ⚠️  Stub — replace with real import once repo is cloned */
function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div data-testid="empty-state" role="status">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {actionLabel && (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import { test, expect } from '@playwright/experimental-ct-react';

test.describe('EmptyState Component', () => {
  test('renders title correctly', async ({ mount }) => {
    const component = await mount(<EmptyState title="No contacts yet" />);
    await expect(component.getByRole('heading')).toContainText('No contacts yet');
  });

  test('renders description when provided', async ({ mount }) => {
    const component = await mount(
      <EmptyState
        title="No campaigns yet"
        description="Create your first campaign to get started."
      />
    );
    await expect(component.getByText('Create your first campaign to get started.')).toBeVisible();
  });

  test('does not render description when omitted', async ({ mount }) => {
    const component = await mount(<EmptyState title="No items" />);
    await expect(component.locator('p')).not.toBeVisible();
  });

  test('renders action button when actionLabel provided', async ({ mount }) => {
    const component = await mount(
      <EmptyState title="No lists" actionLabel="Create List" onAction={() => {}} />
    );
    await expect(component.getByRole('button', { name: 'Create List' })).toBeVisible();
  });

  test('calls onAction when button is clicked', async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <EmptyState
        title="No tags"
        actionLabel="Add Tag"
        onAction={() => {
          clicked = true;
        }}
      />
    );
    await component.getByRole('button', { name: 'Add Tag' }).click();
    expect(clicked).toBe(true);
  });

  test('has correct ARIA role for screen readers', async ({ mount }) => {
    const component = await mount(<EmptyState title="No results" />);
    await expect(component.getByRole('status')).toBeVisible();
  });

  test('does not render action button when actionLabel is omitted', async ({ mount }) => {
    const component = await mount(<EmptyState title="No results" />);
    await expect(component.getByRole('button')).not.toBeVisible();
  });
});
