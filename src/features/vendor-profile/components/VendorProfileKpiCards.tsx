import { Map as MapIcon } from 'lucide-react';

interface VendorProfileKpiCardsProps {
  totalTours?: number;
}

export function VendorProfileKpiCards({ totalTours }: VendorProfileKpiCardsProps) {
  const cards = [
    {
      title: 'TỔNG SỐ TOUR',
      value: totalTours ?? 0,
      icon: MapIcon,
      iconBg: 'bg-secondary/30',
      iconColor: 'text-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-3xl bg-muted/60 p-5"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.iconBg} ${card.iconColor}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {card.value.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
