import { Provider } from 'jotai'
import { LazyMotion, MotionConfig } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'

import { Toaster } from '~/components/ui/sonner'
import { jotaiStore } from '~/lib/jotai'
import { Spring } from '~/lib/spring'

import { ContextMenuProvider } from './context-menu-provider'
import { EventProvider } from './event-provider'
import { I18nProvider } from './i18n-provider'
import { SettingSync } from './setting-sync'
import { StableRouterProvider } from './stable-router-provider'

const loadFeatures = () =>
  import('../framer-lazy-feature').then((res) => res.default)
export const RootProviders: FC<PropsWithChildren> = ({ children }) => (
  <LazyMotion features={loadFeatures} strict key="framer">
    <MotionConfig transition={Spring.presets.smooth}>
      <Provider store={jotaiStore}>
        <EventProvider />
        <StableRouterProvider />
        <SettingSync />
        <ContextMenuProvider />
        <I18nProvider>{children}</I18nProvider>
      </Provider>
    </MotionConfig>
    <Toaster />
  </LazyMotion>
)
