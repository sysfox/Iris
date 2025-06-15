import { useAtomValue } from 'jotai'
import { AnimatePresence, m } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { gallerySettingAtom } from '~/atoms/app'
import { DateRangeIndicator } from '~/components/ui/date-range-indicator'
import { useScrollViewElement } from '~/components/ui/scroll-areas/hooks'
import { useMobile } from '~/hooks/useMobile'
import { usePhotos, usePhotoViewer } from '~/hooks/usePhotoViewer'
import { useTypeScriptHappyCallback } from '~/hooks/useTypeScriptCallback'
import { useVisiblePhotosDateRange } from '~/hooks/useVisiblePhotosDateRange'
import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import type { PhotoManifest } from '~/types/photo'

import { ActionGroup } from './ActionGroup'
import { Masonry } from './Masonic'
import { MasonryHeaderMasonryItem } from './MasonryHeaderMasonryItem'
import { PhotoMasonryItem } from './PhotoMasonryItem'

class MasonryHeaderItem {
  static default = new MasonryHeaderItem()
}

type MasonryItemType = PhotoManifest | MasonryHeaderItem

const FIRST_SCREEN_ITEMS_COUNT = 30

export const MasonryRoot = () => {
  const { columns } = useAtomValue(gallerySettingAtom)
  const hasAnimatedRef = useRef(false)
  const [showFloatingActions, setShowFloatingActions] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const photos = usePhotos()
  const { dateRange, handleRender } = useVisiblePhotosDateRange(photos)
  const scrollElement = useScrollViewElement()

  const photoViewer = usePhotoViewer()
  const handleAnimationComplete = useCallback(() => {
    hasAnimatedRef.current = true
  }, [])
  const isMobile = useMobile()

  // 监听容器宽度变化
  useEffect(() => {
    const updateContainerWidth = () => {
      setContainerWidth(window.innerWidth)
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)

    return () => {
      window.removeEventListener('resize', updateContainerWidth)
    }
  }, [])

  // 动态计算列宽
  const columnWidth = useMemo(() => {
    if (columns === 'auto') {
      return isMobile ? 150 : 300 // 自动模式使用默认列宽
    }

    // 自定义列数模式：根据容器宽度和列数计算列宽
    const availableWidth = containerWidth - (isMobile ? 8 : 32) // 移动端和桌面端的 padding 不同
    const gutter = 4 // 列间距
    const calculatedWidth = (availableWidth - (columns - 1) * gutter) / columns

    // 根据设备类型设置最小和最大列宽
    const minWidth = isMobile ? 120 : 200
    const maxWidth = isMobile ? 250 : 500

    return Math.max(Math.min(calculatedWidth, maxWidth), minWidth)
  }, [isMobile, columns, containerWidth])

  // 监听滚动，控制浮动组件的显示
  useEffect(() => {
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop } = scrollElement
      setShowFloatingActions(scrollTop > 500)
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [scrollElement])

  return (
    <>
      {/* 桌面端：左右分布 */}
      {!isMobile && (
        <>
          <DateRangeIndicator
            dateRange={dateRange.formattedRange}
            location={dateRange.location}
            isVisible={showFloatingActions && !!dateRange.formattedRange}
          />
          <FloatingActionBar showFloatingActions={showFloatingActions} />
        </>
      )}

      {/* 移动端：垂直堆叠 */}
      {isMobile && !!dateRange.formattedRange && (
        <div className="fixed top-0 right-0 left-0 z-50">
          <DateRangeIndicator
            dateRange={dateRange.formattedRange}
            location={dateRange.location}
            isVisible={showFloatingActions && !!dateRange.formattedRange}
            className="relative top-0 left-0"
          />
          <div className="flex justify-end">
            <FloatingActionBar showFloatingActions={showFloatingActions} />
          </div>
        </div>
      )}

      <div className="p-1 lg:px-0 lg:pb-0 [&_*]:!select-none">
        {isMobile && <MasonryHeaderMasonryItem className="mb-1" />}
        <Masonry<MasonryItemType>
          items={useMemo(
            () => (isMobile ? photos : [MasonryHeaderItem.default, ...photos]),
            [photos, isMobile],
          )}
          render={useCallback(
            (props) => (
              <MasonryItem
                {...props}
                onPhotoClick={photoViewer.openViewer}
                photos={photos}
                hasAnimated={hasAnimatedRef.current}
                onAnimationComplete={handleAnimationComplete}
              />
            ),
            [handleAnimationComplete, photoViewer.openViewer, photos],
          )}
          onRender={handleRender}
          columnWidth={columnWidth}
          columnGutter={4}
          rowGutter={4}
          itemHeightEstimate={400}
          itemKey={useTypeScriptHappyCallback((data, _index) => {
            if (data instanceof MasonryHeaderItem) {
              return 'header'
            }
            return (data as PhotoManifest).id
          }, [])}
        />
      </div>
    </>
  )
}

export const MasonryItem = memo(
  ({
    data,
    width,
    index,
    onPhotoClick,
    photos,
    hasAnimated,
    onAnimationComplete,
  }: {
    data: MasonryItemType
    width: number
    index: number
    onPhotoClick: (index: number, element?: HTMLElement) => void
    photos: PhotoManifest[]
    hasAnimated: boolean
    onAnimationComplete: () => void
  }) => {
    // 为每个 item 生成唯一的 key 用于追踪
    const itemKey = useMemo(() => {
      if (data instanceof MasonryHeaderItem) {
        return 'header'
      }
      return (data as PhotoManifest).id
    }, [data])

    // 只对第一屏的 items 做动画，且只在首次加载时
    const shouldAnimate = !hasAnimated && index < FIRST_SCREEN_ITEMS_COUNT

    // 计算动画延迟
    const delay = shouldAnimate
      ? data instanceof MasonryHeaderItem
        ? 0
        : Math.min(index * 0.05, 0.3)
      : 0

    // Framer Motion 动画变体
    const itemVariants = {
      hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95,
        filter: 'blur(4px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          ...Spring.presets.smooth,
          delay,
        },
      },
    }

    if (data instanceof MasonryHeaderItem) {
      return <MasonryHeaderMasonryItem style={{ width }} />
    } else {
      return (
        <m.div
          key={itemKey}
          variants={shouldAnimate ? itemVariants : undefined}
          initial={shouldAnimate ? 'hidden' : 'visible'}
          animate="visible"
          onAnimationComplete={shouldAnimate ? onAnimationComplete : undefined}
        >
          <PhotoMasonryItem
            data={data as PhotoManifest}
            width={width}
            index={index}
            onPhotoClick={onPhotoClick}
            photos={photos}
          />
        </m.div>
      )
    }
  },
)

const FloatingActionBar = ({
  showFloatingActions,
}: {
  showFloatingActions: boolean
}) => {
  const isMobile = useMobile()

  const variants = isMobile
    ? {
        initial: {
          opacity: 0,
        },
        animate: { opacity: 1 },
      }
    : {
        initial: {
          opacity: 0,
          x: 20,
          y: 0,
          scale: 0.95,
        },
        animate: { opacity: 1, x: 0, y: 0, scale: 1 },
      }
  return (
    <AnimatePresence>
      {showFloatingActions && (
        <m.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="initial"
          transition={Spring.presets.snappy}
          className={clsxm(
            'border-material-opaque rounded-xl border bg-black/60 p-3 shadow-2xl backdrop-blur-[70px]',
            isMobile
              ? 'rounded-t-none rounded-br-none -translate-y-px'
              : 'fixed top-4 right-4 z-50 lg:top-6 lg:right-6',
          )}
        >
          <ActionGroup />
        </m.div>
      )}
    </AnimatePresence>
  )
}
