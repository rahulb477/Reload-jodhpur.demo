import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({ light = false, compact = false, className = "" }: { light?: boolean; compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 shrink-0", className)} aria-label="Reload Jodhpur">
      <span className={cn("relative overflow-hidden rounded-md bg-black", compact ? "w-9 h-9" : "w-10 h-10 sm:w-11 sm:h-11")}>
        <Image
          src="/brand/reload-jodhpur-mark.png"
          alt="Reload Jodhpur"
          fill
          sizes="44px"
          className="object-cover"
          priority
        />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={cn("block font-extrabold tracking-[0.04em] text-[15px] sm:text-[17px]", light ? "text-white" : "text-black")}>
            RELOAD <span className="text-[#ff0000]">JODHPUR</span>
          </span>
          <span className={cn("block text-[8.5px] sm:text-[9px] font-semibold tracking-[0.22em] mt-0.5", light ? "text-neutral-300" : "text-neutral-500")}>
            YOUR SEARCH END HERE
          </span>
        </span>
      )}
    </Link>
  );
}
