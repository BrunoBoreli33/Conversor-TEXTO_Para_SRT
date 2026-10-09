import { motion } from "framer-motion";

export default function Artwork() {
  return (
    <motion.aside
      className="artwork"
      aria-label="Arte O Ataque dos Sonhos"
      whileHover={{ scale: 1.012, borderColor: "rgba(190, 123, 255, .75)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="artwork-visual" />
    </motion.aside>
  );
}
