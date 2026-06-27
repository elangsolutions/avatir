import { HStack, SegmentGroup, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../i18n';

type LanguageSwitcherProps = {
  size?: 'sm' | 'md';
  showLabel?: boolean;
};

function resolveLanguage(language: string): SupportedLanguage {
  if (supportedLanguages.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }

  const base = language.split('-')[0];
  if (supportedLanguages.includes(base as SupportedLanguage)) {
    return base as SupportedLanguage;
  }

  return 'en';
}

export function LanguageSwitcher({ size = 'sm', showLabel = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const items = useMemo(
    () =>
      supportedLanguages.map((language) => ({
        value: language,
        label: t(`language.${language}Short`),
      })),
    [t],
  );

  const value = resolveLanguage(i18n.language);

  return (
    <HStack gap={3} align="center">
      {showLabel && (
        <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.14em">
          {t('common.language')}
        </Text>
      )}
      <SegmentGroup.Root
        size={size}
        value={value}
        onValueChange={(details) => {
          if (details.value) {
            void i18n.changeLanguage(details.value as SupportedLanguage);
          }
        }}
        css={{
          bg: 'whiteAlpha.100',
          borderRadius: 'full',
          p: '2px',
          borderWidth: '1px',
          borderColor: 'whiteAlpha.200',
          color: 'white',
          '& [data-part="item"][data-state="checked"]': {
            color: 'gray.950',
          },
        }}
      >
        <SegmentGroup.Indicator
          css={{
            bg: 'teal.400',
            borderRadius: 'full',
            boxShadow: 'sm',
          }}
        />
        <SegmentGroup.Items items={items} />
      </SegmentGroup.Root>
    </HStack>
  );
}
