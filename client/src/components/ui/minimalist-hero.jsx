import { motion } from "framer-motion";
import { cn } from "../../lib/utils.js";

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium tracking-[0.25em] text-neutral-500 transition-colors hover:text-neutral-950"
  >
    {children}
  </a>
);

const SocialIcon = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-200 bg-white/70 text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-400 hover:text-neutral-900"
  >
    <Icon className="h-4 w-4" />
  </a>
);

export function MinimalistHero({
  logoText,
  navLinks = [],
  mainText,
  readMoreLink = "#colecao",
  imageSrc,
  imageAlt,
  overlayText,
  socialLinks = [],
  locationText,
  showHeader = true,
  className,
}) {
  return (
    <section
      className={cn(
        "relative flex min-h-[80vh] w-full flex-col items-center justify-between overflow-hidden rounded-[2rem] border border-yellow-100/70 bg-white/70 p-6 font-sans shadow-card backdrop-blur-[2px] md:p-10",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(250,204,21,0.14),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(254,252,232,0.55)_100%)]" />

      {showHeader && (
        <header className="relative z-30 flex w-full max-w-7xl items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-bold tracking-wider text-neutral-950"
          >
            {logoText}
          </motion.div>

          {navLinks.length > 0 && (
            <nav className="hidden items-center space-x-8 md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.label} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          <motion.a
            href={readMoreLink}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden rounded-full border border-yellow-200 bg-white px-4 py-2 text-xs font-bold tracking-[0.2em] text-neutral-700 transition-colors hover:bg-yellow-400 hover:text-neutral-900 md:inline-flex"
          >
            COLECAO
          </motion.a>
        </header>
      )}

      <div className="relative z-10 grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-8 md:grid-cols-[0.9fr_1.2fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="order-2 text-center md:order-1 md:text-left"
        >
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-neutral-600 md:mx-0">
            {mainText}
          </p>
          <a
            href={readMoreLink}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 underline decoration-yellow-300 decoration-2 underline-offset-4 transition-colors hover:text-yellow-600"
          >
            Explorar colecao
          </a>
        </motion.div>

        <div className="relative order-1 flex min-h-[320px] items-center justify-center md:order-2 md:min-h-[480px]">
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="absolute z-0 h-[270px] w-[270px] rounded-full bg-yellow-400 shadow-[0_30px_120px_rgba(250,204,21,0.45)] md:h-[380px] md:w-[380px] lg:h-[460px] lg:w-[460px]"
          />
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 h-auto w-56 object-contain drop-shadow-xl md:w-72 lg:w-80"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80";
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="order-3 flex items-center justify-center text-center md:justify-end md:text-right"
        >
          <h1 className="text-6xl font-extrabold leading-[0.9] tracking-tighter text-neutral-950 md:text-7xl lg:text-8xl">
            {overlayText.part1}
            <br />
            <span className="text-yellow-500">{overlayText.part2}</span>
          </h1>
        </motion.div>
      </div>

      <footer className="relative z-30 flex w-full max-w-7xl items-center justify-between pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.15 }}
          className="flex items-center space-x-3"
        >
          {socialLinks.map((link) => (
            <SocialIcon key={link.label} {...link} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.25 }}
          className="text-sm font-medium text-neutral-500"
        >
          {locationText}
        </motion.div>
      </footer>
    </section>
  );
}
