"use client"

import { Icon } from "@/components/ui/icon"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function SideNavBar() {
  const pathname = usePathname()

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path === "/" && pathname === "")
    if (isActive) {
      return "text-primary font-bold bg-white/10 rounded border border-white/10 flex items-center gap-md p-sm"
    }
    return "text-on-surface-variant flex items-center gap-md p-sm hover:bg-white/10 hover:border hover:border-white/10 transition-all rounded"
  }

  return (
    <aside className="hidden md:flex flex-col p-md space-y-lg fixed left-0 h-screen w-64 glass-sidebar text-primary font-mono text-body-sm hover:translate-x-1 duration-300 z-30 pt-[80px]">
      <div className="flex items-center gap-sm mb-xl">
        <div className="w-10 h-10 rounded border border-white/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
          <img 
            className="w-full h-full object-cover mix-blend-screen opacity-70" 
            alt="AI Core" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYdseu2YNVqrEdhYBHRj8hwNsycyj575-N0V_GinG5MdDWjdK51B3Hpx4xsWbvDN9o8Ysmu-g72J7IgA_JsY4y0uHwsj_7wLiGGemcKw1Pmx8OOiJ34e1zynRd7B41PQBdQ2AiPKfZKAEELvtCFQlZDWfNiEYFAA7wHT1Q2WlQKHvkMAU31UWxXVEKEiOkqkmRWgDPJx-ZlVzFOxBJTVU-TsBjBebewdmFaemjJYwHTEfQ7f11XzgihfkMc6VdmFrUmYRdr2lv0swN"
          />
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary text-sm tracking-widest uppercase">VOCALIS</h1>
          <p className="text-on-surface-variant text-[10px] opacity-70 tracking-widest">AI_OS_V1.0_INIT</p>
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col gap-sm">
        <Link className={getLinkClass("/")} href="/">
          <Icon name="chat_bubble" size={14} />
          Conversations
        </Link>
        <Link className={getLinkClass("/tasks")} href="#">
          <Icon name="check_circle" size={14} />
          Tasks
        </Link>
        <Link className={getLinkClass("/agents")} href="#">
          <Icon name="smart_toy" size={14} />
          Agents
        </Link>
        <Link className={getLinkClass("/memory")} href="/memory">
          <Icon name="database" size={14} />
          Memory
        </Link>
      </nav>
      
      <div className="mt-auto">
        <a className="text-on-surface-variant flex items-center gap-md p-sm hover:bg-white/10 hover:border hover:border-white/10 transition-all rounded" href="#">
          <Icon name="analytics" size={14} />
          System Status
        </a>
      </div>
    </aside>
  )
}
