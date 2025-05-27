import React from "react";
import { Tabs, Tab, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

/* ---------------- Types ---------------- */
interface ScrollableTabsProps<T> {
  items: T[];
  getId: (item: T) => string;
  getTitle: (item: T) => React.ReactNode;
  children: (item: T) => React.ReactNode;
}

/* -------------- Component -------------- */
export function ScrollableTabs<T>({
  items,
  getId,
  getTitle,
  children
}: ScrollableTabsProps<T>) {
  /* مرجع لقائمة التبويبات */
  const listRef = React.useRef<HTMLDivElement>(null);

  /* حساب هل هناك إزاحة يمين أو يسار مخفية */
  const [canScroll, setCanScroll] = React.useState({
    left: false,
    right: false
  });

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth
    });
  };

  React.useEffect(() => {
    updateScrollState();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = listRef.current;
    if (!el) return;
    const amount = dir === "left" ? -200 : 200;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* أسهم التمرير */}
      {canScroll.left && (
        <Button
          isIconOnly
          variant="light"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-white/80 to-transparent"
          onPress={() => scrollBy("left")}
        >
          <Icon icon="lucide:chevron-left" />
        </Button>
      )}
      {canScroll.right && (
        <Button
          isIconOnly
          variant="light"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-white/80 to-transparent"
          onPress={() => scrollBy("right")}
        >
          <Icon icon="lucide:chevron-right" />
        </Button>
      )}

      {/* تبويبات Heroui */}
      <Tabs
        aria-label="Question Categories"
        color="primary"
        variant="underlined"
        /* نعطي ريف للـ tab list لنتمكّن من التمرير */
        classNames={{
          /* Hide scrollbar but keep scroll ability */
          tabList:
            "flex-nowrap overflow-x-auto scrollbar-none gap-6 px-6",
          tab: "max-w-fit px-0 h-12 shrink-0"
        }}
        ref={listRef as any}
      >
        {items.map(it => (
          <Tab key={getId(it)} title={getTitle(it)}>
            {children(it)}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
