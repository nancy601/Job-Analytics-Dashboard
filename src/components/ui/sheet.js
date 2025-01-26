import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export function Sheet({ children, ...props }) {
  return <Dialog.Root {...props}>{children}</Dialog.Root>;
}

export function SheetTrigger({ children, asChild, ...props }) {
  return (
    <Dialog.Trigger asChild={asChild} {...props}>
      {children}
    </Dialog.Trigger>
  );
}

export function SheetContent({ children, side = 'right', className, ...props }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Dialog.Content
        className={`fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 ${
          side === 'right'
            ? 'inset-y-0 right-0 h-full data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-3xl'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetHeader({ className, ...props }) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
  );
}

export function SheetTitle({ className, ...props }) {
  return <Dialog.Title className={`text-lg font-semibold text-foreground ${className}`} {...props} />;
}

