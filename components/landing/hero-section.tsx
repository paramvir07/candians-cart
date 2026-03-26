'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingCart } from 'lucide-react'

const menuItems = [
  { name: 'How it works', href: '#how-it-works' },
  { name: 'Features',     href: '#features' },
  { name: 'About',        href: '#about' },
  { name: 'Contact',      href: '#contact' },
]

export default function HeroSection() {
  const [menuState, setMenuState] = useState(false)

  return (
    <>
      <header>
        <nav
          data-state={menuState && 'active'}
          className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
          <div className="m-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                {/* Logo */}
                <Link href="/" aria-label="home" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                    <ShoppingCart className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-base font-bold text-foreground tracking-tight">
                    Candian&apos;s Cart
                  </span>
                </Link>

                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                  <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>

              <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150">
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/partner-access">
                      <span>Partner Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/customer/login">
                      <span>Shop Now</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section className="bg-muted/50 dark:bg-background overflow-hidden">
          <div className="relative mx-auto max-w-5xl px-6 pt-28 lg:pt-24">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
                <ShoppingCart className="h-3.5 w-3.5" />
                Family-exclusive grocery platform
              </div>

              <h1 className="text-balance text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl">
                Fresh groceries,{' '}
                <span className="text-primary">real savings</span>{' '}
                for your family.
              </h1>

              <p className="text-muted-foreground mx-auto my-8 max-w-xl text-xl leading-relaxed">
                Candian&apos;s Cart is an invite-only platform connecting
                families to local stores with subsidised pricing, gift wallet
                rewards, and a seamless shopping experience.
              </p>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button asChild size="lg">
                  <Link href="/customer/login">
                    <span>Start Shopping</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/customer/signup">
                    <span>Join Free</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

        </section>
      </main>
    </>
  )
}