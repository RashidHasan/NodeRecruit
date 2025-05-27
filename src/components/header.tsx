import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="bg-primary py-5 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center">
              <img
                src="/assets/mzn.png"
                alt="Company Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-white text-2xl font-bold tracking-wide">NodeRecruit</h1>
              <p className="text-white/70 text-xs">Multi Zillion Nodes</p>
            </div>
          </div>

          {/* Language & Title & Date */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-white">
            {/* Language Selector */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  color="default"
                  className="bg-white/10 text-white px-4 py-2"
                  startContent={<Icon icon="lucide:globe" />}
                >
                  {t('language.select')}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Language selection">
                <DropdownItem key="en" onPress={() => changeLanguage('en')}>
                  {t('language.en')}
                </DropdownItem>
                <DropdownItem key="ar" onPress={() => changeLanguage('ar')}>
                  {t('language.ar')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* Interview Title & Date */}
            <div className="text-center md:text-right leading-snug">
              {/* <h2 className="font-semibold text-base md:text-lg">Dev – Interviews Questions</h2> */}
              {/* <p className="text-white/70 text-sm">Date: 01/06/2025</p> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
