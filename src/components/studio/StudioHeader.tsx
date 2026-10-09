import { motion } from "framer-motion";

export default function StudioHeader() {
  return (
    <header className="topbar">
      <motion.a
        className="brand"
        href="/"
        aria-label="SRT Studio, início"
        whileHover={{ scale: 1.035 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
      >
        <span className="brand-mark" aria-hidden="true">
          <img src="/coroa.svg" alt="" width="48" height="36" />
        </span>
        <span>
          SRT <span className="brand-light">Studio</span>
        </span>
      </motion.a>
    </header>
  );
}
