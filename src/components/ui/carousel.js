import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Carousel({
  opts = {},
  setApi,
  className,
  children,
  onSelect,
  ...props
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...opts,
    skipSnaps: false,
  });

  React.useEffect(() => {
    if (emblaApi) {
      setApi?.(emblaApi);
    }
  }, [emblaApi, setApi]);

  React.useEffect(() => {
    if (emblaApi && onSelect) {
      emblaApi.on('select', () => {
        onSelect(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi, onSelect]);

  return (
    <div ref={emblaRef} className={`overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CarouselContent({ className, ...props }) {
  return <div className={`flex ${className}`} {...props} />;
}

export function CarouselItem({ className, ...props }) {
  return <div className={`min-w-0 shrink-0 grow-0 basis-full ${className}`} {...props} />;
}

export function CarouselPrevious({ className, ...props }) {
  return (
    <button
      className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md ${className}`}
      {...props}
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );
}

export function CarouselNext({ className, ...props }) {
  return (
    <button
      className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md ${className}`}
      {...props}
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

