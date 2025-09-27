"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrencySwitcher } from "@/components/currency-switcher"
import { MessageSquare, BarChart3 } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Chat", icon: MessageSquare },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-6xl">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">💰</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Finance AI
                </span>
              </Link>

              {/* Navigation Links - Only show for signed-in users */}
              <SignedIn>
                <div className="hidden sm:flex items-center space-x-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </SignedIn>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CurrencySwitcher />
              <ThemeToggle />

              <SignedOut>
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </SignedOut>

              <SignedIn>
                <div className="hidden sm:block">
                  <UserButton />
                </div>
                {/* Mobile menu button */}
                <div className="sm:hidden flex items-center space-x-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className="p-2"
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      </Link>
                    )
                  })}
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}