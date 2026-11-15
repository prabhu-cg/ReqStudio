import Image from 'next/image'

/**
 * A CSS-built MacBook holding a 16:10 capture of the real app.
 *
 * The light capture shows in light mode and the dark one in dark mode, swapped
 * with CSS so there is no flash. Captures are 2880x1800 PNGs of the fictional
 * sample project in `public/mockups/`. Retake them whenever the app chrome
 * changes and bump the `-v1` suffix so caches refresh.
 *
 * The device colours are literal on purpose: it is a picture of hardware, so
 * it does not follow the theme tokens.
 */
export function MacbookMockup() {
  return (
    <figure className="mx-auto w-full max-w-5xl">
      <div
        role="img"
        aria-label="ReqStudio's Brief tab open on the sample project, Northwind Rebuild, shown in a laptop"
        className="drop-shadow-[0_32px_48px_rgba(53,51,53,0.22)]"
      >
        {/* Lid */}
        <div className="relative mx-auto w-[88%] rounded-t-[18px] border border-[#4a4a4d] bg-[#1d1d1f] p-[1.6%] pb-[1.4%] sm:rounded-t-[26px]">
          {/* Camera */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[0.7%] size-1 -translate-x-1/2 rounded-full bg-[#3a3a3d] sm:size-1.5"
          />
          <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-background sm:rounded-[8px]">
            <Image
              src="/mockups/workspace-light-v1.png"
              alt=""
              width={2880}
              height={1800}
              sizes="(min-width: 1152px) 900px, 90vw"
              className="absolute inset-0 size-full dark:hidden"
            />
            <Image
              src="/mockups/workspace-dark-v1.png"
              alt=""
              width={2880}
              height={1800}
              sizes="(min-width: 1152px) 900px, 90vw"
              className="absolute inset-0 hidden size-full dark:block"
            />
          </div>
        </div>

        {/* Base, with the thumb notch */}
        <div className="relative h-2.5 w-full rounded-b-[14px] rounded-t-[2px] bg-[#c9c9cc] sm:h-3.5 sm:rounded-b-[20px]">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-1 w-[16%] -translate-x-1/2 rounded-b-full bg-[#a8a8ab] sm:h-1.5"
          />
        </div>
      </div>

      <figcaption className="mt-6 text-center text-sm text-muted-foreground">
        Sample project — fictional data
      </figcaption>
    </figure>
  )
}
