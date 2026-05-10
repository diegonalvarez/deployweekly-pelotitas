'use client';

import RoleActivator from './RoleActivator';

/* Thin wrapper that renders the unified RoleActivator in
   "banner" mode (compact, only inactive roles).             */
export default function ActivateRoleBanner({ currentRole }: { currentRole?: string }) {
  // currentRole is preserved as prop for back-compat with existing callers,
  // but the activator filters out *all* active roles automatically.
  void currentRole;
  return <RoleActivator mode="banner" />;
}
